<template>
  <div class="disc-report-container">
    <div class="report-header">
      <div class="pro-tag">CONFIDENTIAL BEHAVIORAL REPORT</div>
      <h1 class="report-title">DISC 行为风格深度诊断报告</h1>
      <p class="report-meta">评估日期：{{ currentDate }} | 报告编号：{{ sampleId }}</p>
    </div>

    <el-row :gutter="20" class="chart-dashboard">
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header-title">🎯 行为风格雷达图</div>
          </template>
          <div class="chart-container" v-if="radarData && radarData.datasets && radarData.datasets.length > 0">
            <Radar :data="radarData" :options="chartOptions" />
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header-title">📊 维度得分强度对比</div>
          </template>
          <div class="chart-container" v-if="barData && barData.datasets && barData.datasets.length > 0">
            <Bar :data="barData" :options="barOptions" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="conclusion-card" shadow="never">
      <el-row align="middle">
        <el-col :sm="24" :md="8" class="code-box">
          <div class="label">您的 DISC 类型</div>
          <div class="main-code">{{ discType }}</div>
        </el-col>
        <el-col :sm="24" :md="16" class="code-summary">
          <h3>诊断结论：{{ primaryType.name }}主导型</h3>
          <p>您的行为风格以<strong>“{{ primaryType.name }}”</strong>为核心驱动力。{{ primaryType.summary }}在特定情境中，您的{{ secondaryType.name }}特质也会自然展现，形成独特的{{ discType }}组合风格。</p>
        </el-col>
      </el-row>
    </el-card>

    <div class="dimension-detail-section">
      <h2 class="section-title">🔍 DISC 四维度深度解析</h2>
      <div v-for="dim in sortedDimensions" :key="dim.key" class="dim-detail-item" :class="{ 'is-top': dim.key === primaryType.key }">
        <el-card shadow="hover">
          <div class="dim-item-header">
            <div class="dim-badge" :style="{ backgroundColor: dim.color }">{{ dim.key }}</div>
            <div class="dim-title-group">
              <h4>{{ dim.name }} ({{ dim.nameEn }})</h4>
              <el-rate :model-value="dim.starLevel" disabled text-color="#ff9900" />
            </div>
            <div class="dim-score-label">强度指数：{{ dim.score }}</div>
          </div>

          <div class="dim-body">
            <el-row :gutter="40">
              <el-col :sm="24" :md="12">
                <div class="text-block">
                  <h5>📌 核心行为特征</h5>
                  <p>{{ dim.longDesc }}</p>
                </div>
                <div class="text-block">
                  <h5>💼 工作风格偏好</h5>
                  <p>{{ dim.workStyle }}</p>
                </div>
              </el-col>
              <el-col :sm="24" :md="12">
                <div class="text-block warning">
                  <h5>⚠️ 潜在发展领域</h5>
                  <p>{{ dim.blindSpot }}</p>
                </div>
                <div class="text-block success">
                  <h5>🎯 适合的职业方向</h5>
                  <div class="job-tags">
                    <el-tag v-for="job in dim.careerList" :key="job" effect="plain" class="m-1" :color="dim.color + '11'" :style="{ borderColor: dim.color + '55', color: dim.color }">
                      {{ job }}
                    </el-tag>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </div>
    </div>

    <el-card class="career-guide-card" shadow="never">
      <template #header>
        <h3 class="m-0" style="color: #0369a1;">🚀 专属发展建议</h3>
      </template>
      <div class="guide-content">
        <div class="guide-item">
          <h4>1. 发挥核心优势 ({{ primaryType.key }} 主导)</h4>
          <p>{{ primaryType.advice }}</p>
        </div>
        <div class="guide-item">
          <h4>2. 团队协作建议</h4>
          <p>在团队中，您的{{ primaryType.key }}特质使您擅长{{ primaryType.strength }}。建议与{{ complementaryType.key }}型伙伴搭配，互补彼此的盲区，实现更全面的团队绩效。</p>
        </div>
        <div class="guide-item">
          <h4>3. 沟通优化策略</h4>
          <p>在与不同风格的人沟通时，注意调整您的沟通方式：对D型人直接高效，对I型人热情互动，对S型人温和耐心，对C型人精确严谨。灵活切换沟通风格将大幅提升您的影响力。</p>
        </div>
      </div>
    </el-card>

    <div class="report-footer">
      <p>本报告由专业测评系统自动生成。行为风格受情境影响，本建议仅供自我认知和发展参考。</p>
      <el-button type="primary" @click="handlePrint">打印完整PDF报告</el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Radar, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend,
  BarElement, CategoryScale, LinearScale
} from 'chart.js'

ChartJS.register(RadialLinearScale, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const props = defineProps({
  answers: { type: Array, default: () => [] },
  questions: { type: Array, default: () => [] }
})

const sampleId = `DISC-${Math.random().toString(36).slice(2, 11).toUpperCase()}`
const currentDate = new Date().toLocaleDateString()

const discDB = {
  D: {
    name: '支配型', nameEn: 'Dominance', color: '#dc2626', focus: '结果与掌控',
    summary: '您是一位天生的领导者和开拓者，以结果为导向，敢于接受挑战，在压力下表现出色。',
    longDesc: '您具有强烈的成就动机和掌控欲。您说话直接、决策果断，面对困难和竞争时反而更加兴奋。您天生具备推动事情进展的能力，不畏惧冲突和阻力，善于在复杂局面中快速抓住关键。',
    workStyle: '偏好快节奏、高授权的工作环境。喜欢拥有自主决策权，讨厌微观管理和过多的条条框框。',
    blindSpot: '可能在倾听他人意见和关注团队情感需求方面需要加强。有时过于强势的风格会让温和的同事感到压力。',
    strength: '推动决策、引领变革和达成挑战性目标',
    advice: '将您的果断和领导力投入到有挑战性的项目和团队管理中。同时，刻意练习倾听和同理心，在推动结果的同时关注团队成员的情感需求，这将让您从优秀的管理者升级为卓越的领导者。',
    careerList: ['创业者', 'CEO/总经理', '销售总监', '项目经理', '投资银行家', '军事指挥官']
  },
  I: {
    name: '影响型', nameEn: 'Influence', color: '#f59e0b', focus: '人际与表达',
    summary: '您是团队中的能量源泉和沟通桥梁，以热情和乐观感染他人，善于建立广泛的人际网络。',
    longDesc: '您是天生的沟通者和激励者。您乐观开朗、善于表达，在任何群体中都能快速成为焦点。您擅长用故事和情感打动他人，拥有极强的说服力和感染力，是团队氛围的天然催化剂。',
    workStyle: '偏好开放、互动频繁的工作环境。喜欢头脑风暴和团队协作，讨厌孤立和沉闷的工作氛围。',
    blindSpot: '可能在执行细节和跟进承诺方面需要加强。有时过于乐观的倾向可能导致低估风险或忽视实际问题。',
    strength: '激励团队、促进协作和建立广泛的人脉网络',
    advice: '将您的沟通天赋和人际魅力发挥在需要协调多方利益和激励团队的场景中。同时，培养系统性的跟进习惯，让您的创意和热情能够转化为实际可见的成果。',
    careerList: ['公关经理', '市场营销总监', '培训师', '主持人', '客户关系经理', '品牌策划']
  },
  S: {
    name: '稳健型', nameEn: 'Steadiness', color: '#10b981', focus: '和谐与支持',
    summary: '您是团队的稳定器和守护者，以耐心和真诚赢得信任，善于营造和谐稳定的工作环境。',
    longDesc: '您是可靠的团队支柱。您温和耐心、善于倾听，对他人有着真诚的关怀。您不喜欢冲突和突如其来的变化，但一旦承诺就会坚持到底。您在维护团队和谐和确保工作质量方面有着不可替代的价值。',
    workStyle: '偏好稳定、有序的工作环境。喜欢有明确的流程和支持性的团队文化，讨厌频繁的变动和对立冲突。',
    blindSpot: '可能在主动表达观点和应对快速变化方面需要加强。有时过于迁就他人可能导致自己的需求被忽视。',
    strength: '维护团队稳定、提供持续支持和确保执行质量',
    advice: '您的稳定性和可靠性是团队的宝贵财富。在发挥支持角色优势的同时，也要学会适时表达自己的观点和需求，在变化来临时允许自己按照舒适的节奏逐步适应。',
    careerList: ['人力资源经理', '心理咨询师', '行政主管', '护理人员', '教师', '客户服务经理']
  },
  C: {
    name: '谨慎型', nameEn: 'Conscientiousness', color: '#6366f1', focus: '精确与品质',
    summary: '您是团队的质量守护者和逻辑思考者，以严谨和精确追求卓越，善于在复杂信息中找到规律。',
    longDesc: '您是精准的分析者和高标准的质量守护者。您思维缜密、注重细节，对工作有着近乎完美的追求。您擅长逻辑推理和系统分析，在做决定前会充分收集信息，确保万无一失。您的严谨是组织规避风险的关键保障。',
    workStyle: '偏好安静、有序的工作环境。喜欢有明确的规范和标准，讨厌含糊不清和草率行事。',
    blindSpot: '可能在快速决策和灵活应变方面需要加强。有时过度追求完美可能导致决策延迟或给团队带来压力。',
    strength: '确保质量、分析复杂问题和建立规范化流程',
    advice: '将您的分析能力和品质追求投入在需要精确度和专业判断的领域。同时，学会接受“足够好”的标准，在某些情况下快速决策比完美方案更重要，培养在不同场景间切换完美主义和务实主义的能力。',
    careerList: ['数据分析师', '审计师', '质量总监', '研究员', '系统架构师', '合规官']
  }
}

const scores = computed(() => {
  const s = { D: 0, I: 0, S: 0, C: 0 }
  if (props.answers && props.answers.length > 0) {
    props.answers.forEach(a => {
      if (a && a.scoring) {
        Object.keys(a.scoring).forEach(k => {
          if (s[k] !== undefined) s[k] += a.scoring[k]
        })
      }
    })
  }
  return s
})

const maxPossibleScore = computed(() => props.questions.length * 3 || 30)

const sortedDimensions = computed(() => {
  return Object.keys(discDB).map(k => ({
    key: k,
    score: scores.value[k],
    starLevel: Math.min(Math.max(Math.round((scores.value[k] / maxPossibleScore.value) * 5), 1), 5),
    ...discDB[k]
  })).sort((a, b) => b.score - a.score)
})

const primaryType = computed(() => sortedDimensions.value[0] || discDB['D'])
const secondaryType = computed(() => sortedDimensions.value[1] || discDB['I'])
const discType = computed(() => primaryType.value.key + secondaryType.value.key)
const complementaryType = computed(() => {
  const map = { D: 'C', I: 'S', S: 'I', C: 'D' }
  const compKey = map[primaryType.value.key] || 'S'
  return discDB[compKey]
})

const radarData = computed(() => ({
  labels: ['支配 D', '影响 I', '稳健 S', '谨慎 C'],
  datasets: [{
    label: '行为风格分布',
    data: ['D', 'I', 'S', 'C'].map(k => scores.value[k]),
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderColor: '#6366f1',
    borderWidth: 2,
    pointBackgroundColor: ['#dc2626', '#f59e0b', '#10b981', '#6366f1'],
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff'
  }]
}))

const barData = computed(() => ({
  labels: sortedDimensions.value.map(d => d.name),
  datasets: [{
    label: '维度强度得分',
    data: sortedDimensions.value.map(d => d.score),
    backgroundColor: sortedDimensions.value.map(d => d.color + 'cc'),
    borderRadius: 6
  }]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    r: {
      suggestedMin: 0,
      ticks: { stepSize: 5, display: false },
      pointLabels: { font: { size: 13, weight: 'bold' }, color: '#475569' }
    }
  },
  plugins: { legend: { display: false } }
}

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: { beginAtZero: true, grid: { borderDash: [4, 4] } },
    x: { grid: { display: false } }
  },
  plugins: { legend: { display: false } }
}

const handlePrint = () => window.print()
</script>

<style scoped>
.disc-report-container {
  max-width: 1100px; margin: 0 auto; padding: 10px; color: #1e293b;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
}

.report-header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px dashed #cbd5e1; }
.pro-tag { font-size: 0.75rem; font-weight: 800; color: #64748b; letter-spacing: 2px; }
.report-title { font-size: 2.2rem; font-weight: 800; color: #0f172a; margin: 10px 0; }
.report-meta { color: #64748b; font-size: 0.95rem; }

.chart-dashboard { margin-bottom: 40px; }
.chart-card { border-radius: 16px; border: 1px solid #e2e8f0; }
.card-header-title { font-weight: 700; font-size: 1.1rem; color: #1e293b; }
.chart-container { position: relative; height: 350px; width: 100%; }

.conclusion-card { background: #f8fafc; border-left: 6px solid #6366f1; margin-bottom: 40px; border-radius: 12px; }
.main-code { font-size: 4rem; font-weight: 900; color: #0f172a; line-height: 1; letter-spacing: 2px; }
.code-box { text-align: center; border-right: 1px solid #e2e8f0; padding-right: 20px; }
.code-summary h3 { margin-top: 0; font-size: 1.5rem; color: #1e293b; }
.code-summary p { font-size: 1.05rem; line-height: 1.7; color: #475569; margin-bottom: 0; }

.section-title { font-size: 1.6rem; font-weight: 800; text-align: center; margin: 50px 0 30px; color: #0f172a; }

.dim-detail-item { margin-bottom: 25px; }
.dim-detail-item.is-top :deep(.el-card) { border: 2px solid #6366f1; box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.15); }
.dim-detail-item :deep(.el-card) { border-radius: 16px; border: 1px solid #e2e8f0; }

.dim-item-header { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #f1f5f9; }
.dim-badge { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; font-weight: 800; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
.dim-title-group h4 { margin: 0 0 5px 0; font-size: 1.25rem; font-weight: 700; color: #1e293b; }
.dim-score-label { margin-left: auto; font-size: 1.1rem; font-weight: 800; color: #6366f1; background: #e0e7ff; padding: 5px 15px; border-radius: 20px; }

.text-block { margin-bottom: 20px; }
.text-block h5 { margin: 0 0 8px; color: #1e293b; font-size: 1.05rem; font-weight: 700; }
.text-block p { font-size: 0.95rem; color: #475569; line-height: 1.7; margin: 0; text-align: justify; }

.text-block.warning { background: #fffbeb; padding: 15px; border-radius: 12px; border-left: 4px solid #f59e0b; }
.text-block.warning h5 { color: #b45309; }
.text-block.success { background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; }

.job-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
.m-1 { font-weight: 600; font-size: 0.85rem; padding: 4px 10px; height: auto; border-radius: 8px; }

.career-guide-card { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 16px; margin-top: 40px; }
.guide-item { margin-bottom: 20px; }
.guide-item:last-child { margin-bottom: 0; }
.guide-item h4 { color: #0369a1; margin: 0 0 8px 0; font-size: 1.1rem; font-weight: 700; }
.guide-item p { color: #334155; line-height: 1.6; margin: 0; }

.report-footer { text-align: center; margin-top: 60px; padding: 40px 0; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 0.9rem; }
.report-footer p { margin-bottom: 20px; }

@media print {
  .report-footer .el-button { display: none; }
  .chart-dashboard { display: flex !important; }
  .dim-detail-item { page-break-inside: avoid; }
  .disc-report-container { max-width: 100%; padding: 0; }
  .chart-card { border: 1px solid #ccc !important; box-shadow: none !important; }
}

@media (max-width: 768px) {
  .chart-dashboard .el-col { margin-bottom: 20px; }
  .code-box { border-right: none; border-bottom: 1px solid #e2e8f0; padding-right: 0; padding-bottom: 20px; margin-bottom: 20px; }
  .main-code { font-size: 3.5rem; }
  .dim-item-header { flex-wrap: wrap; }
  .dim-score-label { margin-left: 0; }
}
</style>
