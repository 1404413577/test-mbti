<template>
  <div class="holland-report-container">
    <div class="report-header">
      <div class="pro-tag">CONFIDENTIAL ASSESSMENT REPORT</div>
      <h1 class="report-title">霍兰德职业兴趣 (RIASEC) 深度诊断报告</h1>
      <p class="report-meta">评估日期：{{ currentDate }} | 样本编号：ASSESS-{{ Math.random().toString(36).substr(2, 9).toUpperCase() }}</p>
    </div>

    <el-row :gutter="20" class="chart-dashboard">
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header-title">🧠 兴趣能量雷达 (核心模型)</div>
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
          <div class="label">您的职业兴趣代码</div>
          <div class="main-code">{{ topThreeCodes }}</div>
        </el-col>
        <el-col :sm="24" :md="16" class="code-summary">
          <h3>诊断结论：{{ topThreeNames }}型人格</h3>
          <p>您的测试结果显示，您属于典型的<strong>“{{ primaryType.name }}”</strong>主导型人格。您在处理<strong>{{ primaryType.focus }}</strong>方面具有天然的优势和极高的内在驱动力。这种组合意味着您在跨领域协作中能扮演极其关键的角色。</p>
        </el-col>
      </el-row>
    </el-card>

    <div class="dimension-detail-section">
      <h2 class="section-title">🔍 RIASEC 六大维度深度全景扫描</h2>
      <div v-for="dim in sortedDimensions" :key="dim.key" class="dim-detail-item" :class="{ 'is-top': isTopThree(dim.key) }">
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
                  <h5>📌 核心特质画像</h5>
                  <p>{{ dim.longDesc }}</p>
                </div>
                <div class="text-block">
                  <h5>💼 理想工作模式</h5>
                  <p>{{ dim.workMode }}</p>
                </div>
              </el-col>
              <el-col :sm="24" :md="12">
                <div class="text-block warning">
                  <h5>⚠️ 环境适配盲区</h5>
                  <p>{{ dim.blindSpot }}</p>
                </div>
                <div class="text-block success">
                  <h5>🎯 推荐行业与岗位</h5>
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
        <h3 class="m-0" style="color: #0369a1;">🚀 专属职业发展战略建议</h3>
      </template>
      <div class="guide-content">
        <div class="guide-item">
          <h4>1. 核心竞争区 ({{ topThreeCodes.slice(0, 2) }} 组合)</h4>
          <p>您应该将核心精力投入到 <strong>{{ primaryType.name }}</strong> 与 <strong>{{ sortedDimensions[1].name }}</strong> 交叉的领域。发挥您在“{{ primaryType.focus }}”上的天赋，并用“{{ sortedDimensions[1].focus }}”的能力作为辅助。这类岗位能让您在感到舒适的同时，获得最快的晋升通道。</p>
        </div>
        <div class="guide-item">
          <h4>2. 软技能与短板补强</h4>
          <p>基于您的弱势维度 <strong>{{ sortedDimensions[5].name }} ({{ sortedDimensions[5].score }}分)</strong>，建议在团队协作中寻找具备 {{ sortedDimensions[5].key }} 特质的伙伴作为互补，而不是强迫自己独立处理繁琐的 {{ sortedDimensions[5].focus }} 任务。将专业的事交给专业的人，是职业生涯成熟的标志。</p>
        </div>
      </div>
    </el-card>

    <div class="report-footer">
      <p>本报告由专业测评系统自动生成。职业选择受多种因素影响，本建议仅供自我探索参考。</p>
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

// 必须注册 Chart.js 组件
ChartJS.register(RadialLinearScale, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const props = defineProps({
  answers: {
    type: Array,
    default: () => []
  },
  questions: {
    type: Array,
    default: () => []
  }
})

const currentDate = new Date().toLocaleDateString()

// --- RIASEC 数据库 ---
const riasecDB = {
  R: {
    name: '实用型', nameEn: 'Realistic', color: '#64748b', focus: '工具与实物',
    longDesc: '您是一位踏实的“行动派”。您更喜欢处理具体、可见的物体，如机器、工具、植物或动物。您对于理论探讨往往缺乏耐心，但在解决实际物理问题、设备维护或工艺制造方面具有惊人的天赋。',
    workMode: '偏好户外、车间或实验室等非格子间环境。喜欢有明确操作流程、注重产出成果的工作。',
    blindSpot: '在处理复杂的人际关系、情感协调或纯抽象的学术研究时可能会感到枯竭。',
    careerList: ['土木工程师', '机械技师', '外科医生', '飞行员', '自动化专家', '农业科技']
  },
  I: {
    name: '研究型', nameEn: 'Investigative', color: '#6366f1', focus: '逻辑与思想',
    longDesc: '您是天生的“思想家”和“观察者”。您的好奇心极强，喜欢思考、观察、分析和评估。您不满足于表象，总是试图通过逻辑推导找到事物的底层规律。独立钻研是您最高效的状态。',
    workMode: '需要高度智力挑战的环境。喜欢自主探索，讨厌被催促或被琐碎行政事务干扰。',
    blindSpot: '容易过度陷入思考而忽略了执行的实效性；在需要大量社交推销、劝说他人的场合会感到不适。',
    careerList: ['数据科学家', '大学教授', '软件架构师', '经济分析师', '药剂师', '科研人员']
  },
  A: {
    name: '艺术型', nameEn: 'Artistic', color: '#ec4899', focus: '创意与表达',
    longDesc: '您是一位追求自由的“创造者”。您直觉敏锐，情感丰富，极度反感规则的束缚和重复性劳动。您需要通过各种媒介（文字、色彩、声音、设计）来表达您独特的内心世界。',
    workMode: '非结构化的、灵活的工作环境。强调个性化、审美和原创性的文化氛围。',
    blindSpot: '在处理极其严谨的财务审计、标准化流程或高强度科层制管理时会产生强烈的排斥感。',
    careerList: ['创意总监', '室内设计师', '新媒体作家', '策展人', '影视剪辑', '品牌策划']
  },
  S: {
    name: '社会型', nameEn: 'Social', color: '#10b981', focus: '人际与治愈',
    longDesc: '您是温暖的“教育者”和“奉献者”。您的同理心极高，喜欢与人交往，乐于教导、培训、帮助、康复或治愈他人。对他人的成长和社区的和谐感到责任感。',
    workMode: '高度人际互动的环境。注重团队合作、公益价值和社会影响力的组织。',
    blindSpot: '在面对冷冰冰的机器、纯数据运算或需要采取强硬竞争手段、裁员等冲突场景时会感到痛苦。',
    careerList: ['心理咨询师', '人力资源专家', '教育培训师', '医护人员', '社工', '客户成功经理']
  },
  E: {
    name: '企业型', nameEn: 'Enterprising', color: '#f59e0b', focus: '领导与成就',
    longDesc: '您是富有野心的“领导者”和“劝说者”。您极具自信，口才流利，擅长影响、说服和带领他人实现组织目标。您对经济成就、社会地位和政治影响力有较强的追求欲望。',
    workMode: '充满竞争和奖励机制的环境。喜欢拥有决策权、管理权和能够展示个人魅力的舞台。',
    blindSpot: '在需要进行长时间细致入微的研究、精密且无变化的文书归档工作时会显得缺乏耐心。',
    careerList: ['创业者', '销售副总裁', '项目经理', '律师', '政府公职人员', '风险投资人']
  },
  C: {
    name: '常规型', nameEn: 'Conventional', color: '#3b82f6', focus: '秩序与精确',
    longDesc: '您是可靠的“守护者”和“执行者”。您喜欢有条理、按部就班地处理数据、文字或档案。您对精确度有着近乎完美的追求，是维护系统稳定运行和组织规范的核心力量。',
    workMode: '规则明确、分工清晰的环境。注重细节、准确性和安全性的后台管理或支撑部门。',
    blindSpot: '在面对模糊不清的指令、需要打破常规的创新任务或突如其来的环境变故时会感到焦虑。',
    careerList: ['注册会计师', '精算师', '行政主管', '银行内控官', '税务稽查', '数据库管理员']
  }
}

// 提取得分
const scores = computed(() => {
  const s = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
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

// 星级计算依据
const maxPossibleScore = computed(() => {
  return props.questions.length * 3 || 30
})

const sortedDimensions = computed(() => {
  return Object.keys(riasecDB).map(k => ({
    key: k,
    score: scores.value[k],
    starLevel: Math.min(Math.max(Math.round((scores.value[k] / maxPossibleScore.value) * 5), 1), 5), // 安全转换为1-5星级
    ...riasecDB[k]
  })).sort((a, b) => b.score - a.score)
})

const primaryType = computed(() => sortedDimensions.value[0] || riasecDB['R'])
const topThreeCodes = computed(() => sortedDimensions.value.slice(0, 3).map(d => d.key).join(''))
const topThreeNames = computed(() => sortedDimensions.value.slice(0, 3).map(d => d.name).join('、'))

const isTopThree = (key) => topThreeCodes.value.includes(key)

// --- 图表数据 ---
const radarData = computed(() => ({
  labels: ['实用 R', '研究 I', '艺术 A', '社会 S', '企业 E', '常规 C'],
  datasets: [{
    label: '兴趣能量分布',
    data: ['R', 'I', 'A', 'S', 'E', 'C'].map(k => scores.value[k]),
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderColor: '#6366f1',
    borderWidth: 2,
    pointBackgroundColor: '#6366f1',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: '#6366f1'
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

// 修复点：图表配置改为了标准的常规对象，抛弃了存在隐患的 computed
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

const handlePrint = () => {
  window.print()
}
</script>

<style scoped>
.holland-report-container { 
  max-width: 1100px; 
  margin: 0 auto; 
  padding: 10px; 
  color: #1e293b;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
}

.report-header { 
  text-align: center; 
  margin-bottom: 40px; 
  padding-bottom: 20px; 
  border-bottom: 2px dashed #cbd5e1; 
}
.pro-tag { font-size: 0.75rem; font-weight: 800; color: #64748b; letter-spacing: 2px; }
.report-title { font-size: 2.2rem; font-weight: 800; color: #0f172a; margin: 10px 0; }
.report-meta { color: #64748b; font-size: 0.95rem; }

.chart-dashboard { margin-bottom: 40px; }
.chart-card { border-radius: 16px; border: 1px solid #e2e8f0; }
.card-header-title { font-weight: 700; font-size: 1.1rem; color: #1e293b; }

.chart-container { 
  position: relative; 
  height: 350px; 
  width: 100%; 
}

.conclusion-card { 
  background: #f8fafc; 
  border-left: 6px solid #6366f1; 
  margin-bottom: 40px; 
  border-radius: 12px;
}
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

/* 打印样式，隐藏按钮并调整排版 */
@media print {
  .report-footer .el-button { display: none; }
  .chart-dashboard { display: flex !important; }
  .dim-detail-item { page-break-inside: avoid; }
  .holland-report-container { max-width: 100%; padding: 0; }
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