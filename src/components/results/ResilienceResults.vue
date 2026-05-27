<template>
  <div class="resilience-report-container">
    <div class="report-header">
      <div class="pro-tag">CONFIDENTIAL RESILIENCE REPORT</div>
      <h1 class="report-title">心理韧性综合评估报告</h1>
      <p class="report-meta">评估日期：{{ currentDate }} | 报告编号：{{ sampleId }}</p>
    </div>

    <el-row :gutter="20" class="chart-dashboard">
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header-title">🛡️ 心理韧性雷达图</div>
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

    <el-card class="conclusion-card" shadow="never">
      <el-row align="middle">
        <el-col :sm="24" :md="8" class="level-box">
          <div class="label">您的韧性等级</div>
          <div class="level-badge" :style="{ backgroundColor: resilienceLevel.color }">{{ resilienceLevel.label }}</div>
        </el-col>
        <el-col :sm="24" :md="16" class="level-summary">
          <h3>{{ resilienceLevel.title }}</h3>
          <p>{{ resilienceLevel.description }}</p>
        </el-col>
      </el-row>
    </el-card>

    <div class="dimension-detail-section">
      <h2 class="section-title">🔍 四个维度深度分析</h2>
      <div v-for="dim in sortedDimensions" :key="dim.key" class="dim-detail-item" :class="{ 'is-top': dim.key === strongestDimension.key, 'is-weak': dim.key === weakestDimension.key }">
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
                  <h5>📌 维度解读</h5>
                  <p>{{ dim.description }}</p>
                </div>
                <div class="text-block">
                  <h5>💡 日常表现</h5>
                  <p>{{ dim.dailyManifestation }}</p>
                </div>
              </el-col>
              <el-col :sm="24" :md="12">
                <div :class="['text-block', dim.level === 'high' ? 'success' : 'warning']">
                  <h5>{{ dim.level === 'high' ? '✅ 优势保持' : '⚠️ 提升建议' }}</h5>
                  <p>{{ dim.advice }}</p>
                </div>
                <div class="text-block action">
                  <h5>🎯 具体行动方案</h5>
                  <ul class="action-list">
                    <li v-for="action in dim.actions" :key="action">{{ action }}</li>
                  </ul>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </div>
    </div>

    <el-card class="overall-guide-card" shadow="never">
      <template #header>
        <h3 class="m-0" style="color: #0369a1;">🌟 综合提升策略</h3>
      </template>
      <div class="guide-content">
        <div class="guide-item">
          <h4>1. 强化核心优势：{{ strongestDimension.name }}</h4>
          <p>您在<strong>{{ strongestDimension.name }}</strong>方面表现出色，这是您应对逆境的核心武器。建议在日常中有意识地运用这一优势，在面对挑战时首先调用您最擅长的应对资源。同时，可以将您的经验和方法分享给在这方面需要提升的他人，教学相长。</p>
        </div>
        <div class="guide-item">
          <h4>2. 重点发展领域：{{ weakestDimension.name }}</h4>
          <p>您的<strong>{{ weakestDimension.name }}</strong>维度有较大提升空间。建议从小目标开始：{{ weakestDimension.smallStep }}。每次小的成功都会积累成更大的信心和能力，逐步填补韧性拼图中最需要加强的一块。</p>
        </div>
        <div class="guide-item">
          <h4>3. 韧性系统构建</h4>
          <p>心理韧性不是单一能力，而是四个维度的动态平衡。建议您建立“韧性日志”，每周记录一次在四个维度上的小进步。当某个维度暂时薄弱时，善用其他维度的资源来弥补——例如用社会支持来缓冲情绪调节的压力，或用乐观主义来增强自我效能感。</p>
        </div>
      </div>
    </el-card>

    <div class="report-footer">
      <p>本报告由专业测评系统自动生成。心理韧性是可以通过训练提升的能力，本建议仅供自我发展参考。</p>
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

const sampleId = `RSL-${Math.random().toString(36).slice(2, 11).toUpperCase()}`
const currentDate = new Date().toLocaleDateString()

const resilienceDB = {
  '情绪调节': {
    name: '情绪调节', icon: '🧘', color: '#10b981',
    description: '情绪调节是您在面对压力、挫折和负面事件时，管理自身情绪反应并迅速恢复内心平衡的能力。高情绪调节者能在风暴中保持冷静，低情绪调节者容易被情绪淹没。',
    dailyManifestation: '在日常中表现为：遇到突发状况时的冷静程度、从负面情绪中恢复的速度、面对批评时的情绪稳定性。',
    levels: {
      high: { advice: '您的情绪调节能力是您的宝贵资产。继续保持冥想、运动或写日记等有助于情绪管理的习惯，将这些方法教给身边需要帮助的人。', actions: ['每天保持5-10分钟的正念或冥想练习', '建立情绪触发预警机制，提前识别压力信号', '将有效的情绪调节策略整理成个人工具箱'] },
      mid: { advice: '您的情绪调节能力处于中等水平。建议建立更系统的情绪管理策略，在平静时期多加练习，以便在风暴来临时有足够的准备。', actions: ['学习至少两种情绪调节技术（如深呼吸、认知重评）', '每天记录情绪波动日记，识别触发模式', '在感到情绪波动时给自己设置“冷静间隔”'] },
      low: { advice: '情绪调节是您可以重点建设的领域。从基础开始：学习识别和命名自己的情绪，然后逐步掌握调节技巧。', actions: ['从学习基本情绪词汇开始，每天练习情绪识别', '建立“安全港湾”——一个可以让自己快速平静下来的空间或仪式', '寻求专业心理咨询师的指导，系统学习情绪管理'] }
    },
    smallStep: '每天花5分钟记录自己的情绪变化'
  },
  '乐观主义': {
    name: '乐观主义', icon: '🌅', color: '#f59e0b',
    description: '乐观主义是您在困境中保持积极期待、从挫折中看到成长机会的能力。高乐观者不是盲目乐观，而是拥有“现实乐观”——在承认困难的同时坚信自己能够渡过难关。',
    dailyManifestation: '在日常中表现为：对未来的期待程度、在困难中发现积极意义的能力、对自身发展的信心水平。',
    levels: {
      high: { advice: '您的乐观主义是您的精神支柱。继续保持这种积极的生活态度，同时注意保持现实感，避免过度乐观导致风险低估。', actions: ['练习“最佳可能自我”书写，具象化未来愿景', '在保持乐观的同时，制定务实的备份计划', '用您的乐观能量感染和带动身边的人'] },
      mid: { advice: '您的乐观水平适中。建议加强积极心理训练，刻意练习在负面事件中发现积极面，让乐观成为一种更自然的思维习惯。', actions: ['每天写下3件值得感恩的事', '练习认知重构：将负面事件重新解读为成长机会', '减少与过度消极人群的接触时间'] },
      low: { advice: '提升乐观主义需要时间，但完全可以实现。从小的积极体验开始积累，逐步重建对未来的信心和期待。', actions: ['从每天找到一个积极瞬间开始', '学习区分“事实”和“悲观的解读”', '主动回忆过去的成功经历，建立积极记忆库'] }
    },
    smallStep: '每天写下1件让你感到有希望的事情'
  },
  '自我效能': {
    name: '自我效能', icon: '💪', color: '#6366f1',
    description: '自我效能是您对自己应对挑战、解决问题的能力的信心。高自我效能者相信自己能够影响结果，因此在困难面前更持久、更有创造力；低自我效能者容易在困难面前退缩。',
    dailyManifestation: '在日常中表现为：接受新任务时的自信程度、面对困难时的坚持力、对自己能力的总体评价。',
    levels: {
      high: { advice: '您强大的自我效能感是您在各个领域取得成就的基石。继续保持挑战自我和从经验中学习的好习惯，适当承担有挑战性的任务来维持这种状态。', actions: ['设定递进式挑战目标，持续扩展能力边界', '记录成功日志，积累“我能行”的证据', '在团队中担任导师角色，通过教导他人强化自我效能'] },
      mid: { advice: '您的自我效能处于中等水平。建议通过设定和达成小目标来积累成功经验，逐步建立更强的自信心。', actions: ['从每周完成一个小挑战开始建立成功惯性', '找到一位能力相近的榜样，观察他们的成长路径', '学会将大目标拆解为可管理的小步骤'] },
      low: { advice: '自我效能是可以培养的。从最容易成功的小事开始，每次完成都是对自己能力的一次重新确认。', actions: ['从难度最低的任务开始建立成功体验', '寻找支持和鼓励你的伙伴，建立积极反馈环境', '回顾自己过去已经克服的困难，重新认识自己的能力'] }
    },
    smallStep: '设定并完成一个今天就能做到的小目标'
  },
  '社会支持': {
    name: '社会支持', icon: '🤝', color: '#ec4899',
    description: '社会支持是您建立和维护支持性关系网络的能力。强大的社会支持系统是应对逆境的最重要缓冲器之一——知道有人在乎你、支持你，本身就是强大的心理资源。',
    dailyManifestation: '在日常中表现为：遇到困难时是否有人可以倾诉、人际关系的深度和广度、给予和接受帮助的自如程度。',
    levels: {
      high: { advice: '您拥有强大的社会支持网络，这是您应对生活挑战的坚实后盾。珍惜并持续维护这些珍贵的关系，同时也成为他人的支持来源。', actions: ['定期维护重要的关系连接，质量重于数量', '深化核心关系的深度而非广度', '主动成为他人的支持系统，建立互助循环'] },
      mid: { advice: '您的社会支持处于中等水平。建议更加主动地建立和维护支持性关系，学会在需要时开口求助。', actions: ['每周主动联系一个重要的朋友或家人', '参加兴趣社群，扩展志同道合的社交圈', '练习表达自己需要帮助的勇气'] },
      low: { advice: '建立社会支持需要主动投入，但回报是巨大的。从小处开始，逐步建立信任和连接，让支持网络自然生长。', actions: ['从每周一次真诚的对话开始', '加入一个支持性社群或互助小组', '练习先给予他人小支持，逐步建立互惠关系'] }
    },
    smallStep: '今天给一个你想联系的人发一条真诚的信息'
  }
}

const scores = computed(() => {
  const s = { '情绪调节': 0, '乐观主义': 0, '自我效能': 0, '社会支持': 0 }
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

const maxPossibleScore = computed(() => props.questions.length * 3 || 25)

const getLevel = (score) => {
  const ratio = score / maxPossibleScore.value
  if (ratio >= 0.7) return 'high'
  if (ratio >= 0.4) return 'mid'
  return 'low'
}

const levelLabels = { high: '优势', mid: '中等', low: '待提升' }

const sortedDimensions = computed(() => {
  return Object.keys(resilienceDB).map(k => {
    const level = getLevel(scores.value[k])
    return {
      key: k,
      score: scores.value[k],
      level,
      levelLabel: levelLabels[level],
      starLevel: Math.min(Math.max(Math.round((scores.value[k] / maxPossibleScore.value) * 5), 1), 5),
      ...resilienceDB[k],
      advice: resilienceDB[k].levels[level].advice,
      actions: resilienceDB[k].levels[level].actions
    }
  }).sort((a, b) => b.score - a.score)
})

const strongestDimension = computed(() => sortedDimensions.value[0])
const weakestDimension = computed(() => sortedDimensions.value[sortedDimensions.value.length - 1])

const totalScore = computed(() => Object.values(scores.value).reduce((a, b) => a + b, 0))
const maxTotal = computed(() => maxPossibleScore.value * 4)

const resilienceLevel = computed(() => {
  const ratio = totalScore.value / maxTotal.value
  if (ratio >= 0.75) return {
    label: '优秀', color: '#10b981',
    title: '您的心理韧性处于优秀水平',
    description: '您拥有非常强大的心理韧性，能够在大多数逆境中保持良好的心态和适应能力。您的四维度均衡发展为您提供了全方位的心理保护。建议您继续保持现有的积极习惯，并可以将您的经验分享给他人。'
  }
  if (ratio >= 0.55) return {
    label: '良好', color: '#6366f1',
    title: '您的心理韧性处于良好水平',
    description: '您具备较好的心理韧性基础，能够应对大多数日常挑战。某些维度可能存在相对薄弱之处，通过针对性的提升可以进一步增强您的整体韧性水平。'
  }
  if (ratio >= 0.35) return {
    label: '一般', color: '#f59e0b',
    title: '您的心理韧性处于一般水平',
    description: '您具备基本的心理韧性，但在面对较大压力时可能会感到吃力。建议重点关注得分较低的维度，通过系统训练逐步提升整体韧性。'
  }
  return {
    label: '待提升', color: '#dc2626',
    title: '您的心理韧性需要系统提升',
    description: '您当前的心理韧性水平提示需要更多关注和建设。这不是一个永久的状态——心理韧性是可以训练和提升的能力。建议从最薄弱的维度开始，逐步建立更强大的心理应对资源。'
  }
})

const radarData = computed(() => ({
  labels: ['情绪调节', '乐观主义', '自我效能', '社会支持'],
  datasets: [{
    label: '韧性维度分布',
    data: ['情绪调节', '乐观主义', '自我效能', '社会支持'].map(k => scores.value[k]),
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderColor: '#6366f1',
    borderWidth: 2,
    pointBackgroundColor: ['#10b981', '#f59e0b', '#6366f1', '#ec4899'],
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff'
  }]
}))

const barData = computed(() => ({
  labels: sortedDimensions.value.map(d => d.name),
  datasets: [{
    label: '韧性维度得分',
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
.resilience-report-container {
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
.level-badge { font-size: 2.2rem; font-weight: 900; color: white; padding: 12px 30px; border-radius: 16px; display: inline-block; letter-spacing: 2px; }
.level-box { text-align: center; border-right: 1px solid #e2e8f0; padding-right: 20px; }
.level-summary h3 { margin-top: 0; font-size: 1.5rem; color: #1e293b; }
.level-summary p { font-size: 1.05rem; line-height: 1.7; color: #475569; margin-bottom: 0; }
.label { font-size: 0.9rem; color: #64748b; margin-bottom: 10px; font-weight: 600; }

.section-title { font-size: 1.6rem; font-weight: 800; text-align: center; margin: 50px 0 30px; color: #0f172a; }

.dim-detail-item { margin-bottom: 25px; }
.dim-detail-item.is-top :deep(.el-card) { border: 2px solid #10b981; box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.15); }
.dim-detail-item.is-weak :deep(.el-card) { border: 2px solid #f59e0b; box-shadow: 0 10px 25px -5px rgba(245, 158, 11, 0.15); }
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
.text-block.success { background: #f0fdf4; padding: 15px; border-radius: 12px; border-left: 4px solid #10b981; }
.text-block.success h5 { color: #065f46; }
.text-block.action { background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; }

.action-list { margin: 8px 0 0 0; padding-left: 1.2rem; }
.action-list li { font-size: 0.9rem; color: #475569; line-height: 1.8; }

.overall-guide-card { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 16px; margin-top: 40px; }
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
  .resilience-report-container { max-width: 100%; padding: 0; }
  .chart-card { border: 1px solid #ccc !important; box-shadow: none !important; }
}

@media (max-width: 768px) {
  .chart-dashboard .el-col { margin-bottom: 20px; }
  .level-box { border-right: none; border-bottom: 1px solid #e2e8f0; padding-right: 0; padding-bottom: 20px; margin-bottom: 20px; }
  .dim-item-header { flex-wrap: wrap; }
  .dim-score-label { margin-left: 0; }
}
</style>
