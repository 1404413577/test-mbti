<template>
  <div class="so-report-container">
    <div class="report-header">
      <div class="pro-tag">CONFIDENTIAL SPECTRUM REPORT</div>
      <h1 class="report-title">性取向光谱评估报告</h1>
      <p class="report-meta">评估日期：{{ currentDate }} | 报告编号：{{ sampleId }}</p>
    </div>

    <el-row :gutter="20" class="chart-dashboard">
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header-title">🌈 性取向光谱雷达</div>
          </template>
          <div class="chart-container" v-if="radarData && radarData.datasets && radarData.datasets.length > 0">
            <Radar :data="radarData" :options="chartOptions" />
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header-title">📊 各维度得分对比</div>
          </template>
          <div class="chart-container" v-if="barData && barData.datasets && barData.datasets.length > 0">
            <Bar :data="barData" :options="barOptions" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="spectrum-card" shadow="never">
      <template #header>
        <h3 class="m-0" style="color: #1e293b;">🎯 光谱定位</h3>
      </template>
      <div class="spectrum-visual">
        <div class="spectrum-bar">
          <div class="bar-end left">异性恋端</div>
          <div class="bar-track">
            <div class="bar-indicator" :style="{ left: indicatorPosition + '%' }"></div>
          </div>
          <div class="bar-end right">同性恋端</div>
        </div>
        <p class="spectrum-note">性取向是一个连续的多元光谱。每个人都在这个光谱上有自己独特的位置，且这个位置可能是流动的。</p>
      </div>
    </el-card>

    <div class="dimension-detail-section">
      <h2 class="section-title">🔍 四维度深度解读</h2>
      <div v-for="dim in sortedDimensions" :key="dim.key" class="dim-detail-item">
        <el-card shadow="hover">
          <div class="dim-item-header">
            <div class="dim-badge" :style="{ backgroundColor: dim.color }">{{ dim.icon }}</div>
            <div class="dim-title-group">
              <h4>{{ dim.name }}</h4>
              <el-rate :model-value="dim.starLevel" disabled text-color="#ff9900" />
            </div>
            <div class="dim-score-label">{{ dim.levelLabel }}：{{ dim.score }}分</div>
          </div>

          <div class="dim-body">
            <el-row :gutter="40">
              <el-col :sm="24" :md="12">
                <div class="text-block">
                  <h5>📌 维度含义</h5>
                  <p>{{ dim.description }}</p>
                </div>
                <div class="text-block">
                  <h5>💡 对您而言</h5>
                  <p>{{ dim.personalInsight }}</p>
                </div>
              </el-col>
              <el-col :sm="24" :md="12">
                <div :class="['text-block', dim.isHigh ? 'success' : 'info-block']">
                  <h5>{{ dim.isHigh ? '🌟 显著特征' : '📝 解读' }}</h5>
                  <p>{{ dim.characteristic }}</p>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </div>
    </div>

    <el-card class="summary-card" shadow="never">
      <template #header>
        <h3 class="m-0" style="color: #0369a1;">📋 综合解读</h3>
      </template>
      <div class="summary-content">
        <p>{{ summaryText }}</p>
      </div>
    </el-card>

    <div class="disclaimer-card">
      <h4>💬 重要说明</h4>
      <ul>
        <li>性取向是多元光谱，而非非此即彼的二元分类。本报告使用"异性恋端—同性恋端"的光谱模型，仅用于描述特定维度上的相对倾向。</li>
        <li>本评估结果仅反映您当前的自我感受和经历，性取向可能随时间和个人成长而自然变化。</li>
        <li>无论您在光谱上的哪个位置，每种性取向都值得同等的尊重和认可。</li>
        <li>本报告仅供自我探索参考，不构成任何医学或心理学诊断。如有需要，请咨询专业的心理咨询师。</li>
      </ul>
    </div>

    <div class="report-footer">
      <p>本报告由专业测评系统自动生成。性取向是个人隐私的核心部分，测评数据不会对外泄露。</p>
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

const sampleId = `SPC-${Math.random().toString(36).slice(2, 11).toUpperCase()}`
const currentDate = new Date().toLocaleDateString()

const dimDB = {
  '异性吸引': {
    name: '异性吸引', icon: '💙', color: '#3b82f6',
    description: '衡量您对不同性别（非自身性别）者的情感和性吸引力倾向。高得分表示您在这方面有较强的吸引体验。',
    levels: {
      high: {
        personalInsight: '您对不同性别者有较为显著的吸引力感受，这是您性取向光谱中的重要组成部分。您在异性关系中可能更容易产生心动的感觉和亲密渴望。',
        characteristic: '您的异性吸引维度较为突出，这可能体现在日常对他人的关注、浪漫幻想和情感投射上主要集中在不同性别者。这是自然界中最常见但也同样值得珍视的取向表达。'
      },
      mid: {
        personalInsight: '您对不同性别者存在一定的吸引力感受，但不是您光谱中唯一或主导的部分。您可能在特定情境或对特定类型的人产生这种吸引。',
        characteristic: '适中的异性吸引水平意味着您在情感和性吸引方面具有灵活性和开放性，不会被单一性别的吸引力所完全定义。'
      },
      low: {
        personalInsight: '您对不同性别者的吸引力感受相对较弱或不明显。这完全正常——吸引力光谱的本质就是多样性，每个人的配置都独一无二。',
        characteristic: '较低的异性吸引维度表明您的情感能量和性吸引力可能更多地指向其他方向，或您对性别本身的关注度较低，更看重其他方面的联结。'
      }
    }
  },
  '同性吸引': {
    name: '同性吸引', icon: '💚', color: '#10b981',
    description: '衡量您对相同性别者的情感和性吸引力倾向。高得分表示您在这方面有较强的吸引体验。',
    levels: {
      high: {
        personalInsight: '您对相同性别者有较为显著的吸引力感受，这是您性取向光谱中的重要组成部分。您在同性别者身上找到了强烈的情感共鸣和吸引力。',
        characteristic: '较高的同性吸引维度反映了您对同性别者的深刻情感和性吸引。这是在人类性取向光谱中自然且广泛存在的取向表达，有着悠久的历史和文化脉络。'
      },
      mid: {
        personalInsight: '您对相同性别者存在一定的吸引力感受，但不是主导性的。您可能在特定情境下或对特定的人产生这种吸引体验。',
        characteristic: '适中的同性吸引水平表明您的情感光谱具有多样性。您能够欣赏和体验同性别者的吸引力，这为您的情感世界增添了丰富的层次。'
      },
      low: {
        personalInsight: '您对相同性别者的吸引力感受相对较弱或不明显。这不代表任何问题——每个人的光谱配置都是独特的，都是正常人类多样性的体现。',
        characteristic: '较低的同性吸引维度意味着您的核心吸引力主要指向其他方向。这同样是人类性取向光谱中完全自然的一个位置。'
      }
    }
  },
  '情感联结': {
    name: '情感联结', icon: '💜', color: '#8b5cf6',
    description: '衡量您超越性别框架建立深层情感连接的能力和倾向。高得分表示情感连接对您而言比性别标签更重要。',
    levels: {
      high: {
        personalInsight: '对您而言，建立深层情感连接时，性别不是决定性因素。您更关注一个人的内在品质、情感共鸣和精神契合度。这是非常成熟和开放的情感模式。',
        characteristic: '高情感联结维度表明您具有超越性别框架去爱和连接的能力。您的情感世界以人的本质为中心，而非以外在的性别标签来导航。这在心理学上被认为是一种高度整合的情感能力。'
      },
      mid: {
        personalInsight: '您在情感联结中会考虑性别因素，但不让它成为决定性的门槛。您能够在适当的情境下超越性别预设，关注到人的内在本质。',
        characteristic: '适中的情感联结水平表明您具有一定的情感灵活性。性别对您而言是一个参考维度，但不是唯一或绝对的过滤条件。'
      },
      low: {
        personalInsight: '性别在您的情感联结中扮演着较为重要的角色，您倾向于在特定性别框架内建立深层关系。这是完全正常且常见的模式。',
        characteristic: '较低的情感联结维度意味着您的情感连接模式中有较为清晰的性别偏好。这为您提供了稳定和可预期的情感体验框架。'
      }
    }
  },
  '自我认同': {
    name: '自我认同', icon: '🧡', color: '#f59e0b',
    description: '衡量您对自己性取向的认知清晰度、接纳程度和内在一致性。高得分表示您有较为清晰的自我认知。',
    levels: {
      high: {
        personalInsight: '您对自己的性取向有较为清晰的认知和定位。无论您在光谱的哪个位置，您对自己的感受有较好的理解和接纳。这是心理健康的重要指标之一。',
        characteristic: '高自我认同维度表明您经历了有意义的自我探索过程，并对自己的性取向形成了内在一致的理解。这种自我认知的清晰度本身就是一种心理资源，有助于建立真诚的人际关系。'
      },
      mid: {
        personalInsight: '您对自己的性取向有一定的认知，但可能仍有一些不确定或正在探索的部分。这种探索是完全健康的——自我认知是一个持续发展的过程。',
        characteristic: '适中的自我认同水平表明您正处于积极自我探索的过程中。对性取向的思考和提问本身就是成长的一部分，保持开放和好奇的态度比急于获得答案更重要。'
      },
      low: {
        personalInsight: '您可能正在经历对性取向的困惑或不确定。请知道：这种感受是许多人成长过程中的一部分。自我认同的建立需要时间、经历和自我关怀。',
        characteristic: '较低的自我认同维度提示您可能处于性取向探索的早期阶段。这不是缺陷，而是成长的起点。给自己足够的空间和时间，避免用外界的标准来苛求自己。'
      }
    }
  }
}

const scores = computed(() => {
  const s = { '异性吸引': 0, '同性吸引': 0, '情感联结': 0, '自我认同': 0 }
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

const maxPossibleScore = computed(() => props.questions.length * 3 || 20)

const getLevel = (score) => {
  const ratio = score / maxPossibleScore.value
  if (ratio >= 0.6) return 'high'
  if (ratio >= 0.3) return 'mid'
  return 'low'
}

const levelLabels = { high: '显著', mid: '中等', low: '温和' }

const sortedDimensions = computed(() => {
  return Object.keys(dimDB).map(k => {
    const level = getLevel(scores.value[k])
    return {
      key: k,
      score: scores.value[k],
      level,
      levelLabel: levelLabels[level],
      isHigh: level === 'high',
      starLevel: Math.min(Math.max(Math.round((scores.value[k] / maxPossibleScore.value) * 5), 1), 5),
      ...dimDB[k],
      personalInsight: dimDB[k].levels[level].personalInsight,
      characteristic: dimDB[k].levels[level].characteristic
    }
  }).sort((a, b) => b.score - a.score)
})

const heteroScore = computed(() => scores.value['异性吸引'] || 0)
const homoScore = computed(() => scores.value['同性吸引'] || 0)

const indicatorPosition = computed(() => {
  const total = heteroScore.value + homoScore.value
  if (total === 0) return 50
  return Math.round((homoScore.value / total) * 100)
})

const summaryText = computed(() => {
  const hetero = heteroScore.value
  const homo = homoScore.value
  const bonding = scores.value['情感联结'] || 0
  const identity = scores.value['自我认同'] || 0

  if (bonding > hetero && bonding > homo && bonding > identity * 0.8) {
    return '您的情感联结维度最为突出，表明您更倾向于超越性别的框架去建立深刻的人际连接。对您而言，一个人的内在品质、精神世界和情感共鸣比外在的性别标签更为重要。这种模式体现了一种以人的本质为核心的情感取向，具有高度的灵活性和包容性。'
  }

  if (hetero > homo * 2 && hetero > bonding) {
    return '您的性取向光谱主要分布在异性恋一端。您对不同性别者有着自然而稳定的情感和性吸引力，这是您情感世界的核心组成部分。请记住，光谱位置并不妨碍您对不同性别者保持尊重、理解和友好。每种取向都有其独特的美和价值。'
  }

  if (homo > hetero * 2 && homo > bonding) {
    return '您的性取向光谱主要分布在同性恋一端。您对同性别者有着深刻的情感共鸣和吸引力，这是您真实自我的重要组成部分。自我接纳是心理健康的重要基石，无论您目前处于哪个阶段，请对自己的感受保持诚实和温柔。'
  }

  if (Math.abs(hetero - homo) < hetero * 0.4 || (hetero > 0 && homo > 0 && Math.abs(hetero - homo) < 10)) {
    return '您的性取向光谱显示您对不同性别和相同性别者都存在有意义的吸引力体验。您的吸引力不局限于单一的性别方向，这为您打开了更广阔的人际和情感世界。双性恋、泛性恋或酷儿等认同都是人类性取向多样性中真实且重要的存在。'
  }

  return '您的性取向光谱呈现出独特的个人模式。这提醒我们：人类的性取向是极其多样和个性化的，任何简单的分类都无法完全描述一个人的全部情感体验。最重要的是您对自己感受的诚实和接纳，而非将自己放入某个预设的框架中。'
})

const radarData = computed(() => ({
  labels: ['异性吸引', '同性吸引', '情感联结', '自我认同'],
  datasets: [{
    label: '性取向光谱分布',
    data: ['异性吸引', '同性吸引', '情感联结', '自我认同'].map(k => scores.value[k]),
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: '#8b5cf6',
    borderWidth: 2,
    pointBackgroundColor: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'],
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff'
  }]
}))

const barData = computed(() => ({
  labels: sortedDimensions.value.map(d => d.name),
  datasets: [{
    label: '维度得分',
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
.so-report-container {
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

/* Spectrum bar */
.spectrum-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; margin-bottom: 40px; }
.spectrum-visual { padding: 10px 0; }
.spectrum-bar { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
.bar-end { font-size: 0.9rem; font-weight: 600; color: #64748b; min-width: 72px; }
.bar-end.left { text-align: right; }
.bar-track { flex: 1; height: 12px; background: linear-gradient(to right, #3b82f6, #8b5cf6, #10b981); border-radius: 6px; position: relative; }
.bar-indicator { position: absolute; top: -6px; width: 24px; height: 24px; background: white; border: 3px solid #1e293b; border-radius: 50%; transform: translateX(-50%); box-shadow: 0 2px 8px rgba(0,0,0,0.2); transition: left 0.8s ease; }
.spectrum-note { text-align: center; font-size: 0.9rem; color: #64748b; line-height: 1.6; margin: 0; }

.section-title { font-size: 1.6rem; font-weight: 800; text-align: center; margin: 50px 0 30px; color: #0f172a; }

.dim-detail-item { margin-bottom: 25px; }
.dim-detail-item :deep(.el-card) { border-radius: 16px; border: 1px solid #e2e8f0; }

.dim-item-header { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #f1f5f9; }
.dim-badge { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; font-weight: 800; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
.dim-title-group h4 { margin: 0 0 5px 0; font-size: 1.25rem; font-weight: 700; color: #1e293b; }
.dim-score-label { margin-left: auto; font-size: 1.1rem; font-weight: 800; color: #8b5cf6; background: #ede9fe; padding: 5px 15px; border-radius: 20px; }

.text-block { margin-bottom: 20px; }
.text-block h5 { margin: 0 0 8px; color: #1e293b; font-size: 1.05rem; font-weight: 700; }
.text-block p { font-size: 0.95rem; color: #475569; line-height: 1.7; margin: 0; text-align: justify; }

.text-block.success { background: #f0fdf4; padding: 15px; border-radius: 12px; border-left: 4px solid #10b981; }
.text-block.success h5 { color: #065f46; }
.text-block.info-block { background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; }

.summary-card { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 16px; margin-top: 40px; }
.summary-content p { color: #334155; line-height: 1.8; font-size: 1.05rem; text-align: justify; margin: 0; }

.disclaimer-card { background: #fffbeb; border: 1px solid #fde68a; border-radius: 16px; padding: 1.5rem 2rem; margin-top: 30px; }
.disclaimer-card h4 { color: #92400e; margin: 0 0 12px 0; font-size: 1.1rem; font-weight: 700; }
.disclaimer-card ul { margin: 0; padding-left: 1.5rem; }
.disclaimer-card li { font-size: 0.9rem; color: #78350f; line-height: 1.8; }

.report-footer { text-align: center; margin-top: 60px; padding: 40px 0; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 0.9rem; }
.report-footer p { margin-bottom: 20px; }

@media print {
  .report-footer .el-button { display: none; }
  .chart-dashboard { display: flex !important; }
  .dim-detail-item { page-break-inside: avoid; }
  .so-report-container { max-width: 100%; padding: 0; }
  .chart-card { border: 1px solid #ccc !important; box-shadow: none !important; }
}

@media (max-width: 768px) {
  .chart-dashboard .el-col { margin-bottom: 20px; }
  .dim-item-header { flex-wrap: wrap; }
  .dim-score-label { margin-left: 0; }
  .bar-end { font-size: 0.75rem; min-width: 56px; }
}
</style>
