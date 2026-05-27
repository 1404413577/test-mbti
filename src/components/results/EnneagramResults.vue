<template>
  <div class="enneagram-report-container">
    <div class="report-header">
      <div class="pro-tag">DEEP PSYCHOLOGICAL PROFILE</div>
      <h1 class="report-title">九型人格 (Enneagram) 深度诊断报告</h1>
      <p class="report-meta">评估日期：{{ currentDate }} | 样本编号：{{ sampleId }}</p>
    </div>

    <el-row :gutter="20" class="chart-dashboard">
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <template #header><div class="card-header-title">🧿 内在动机九芒星雷达</div></template>
          <div class="chart-container" v-if="radarData.datasets[0].data.length > 0">
            <Radar :data="radarData" :options="radarOptions" />
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <template #header><div class="card-header-title">📊 九大特质能量分布</div></template>
          <div class="chart-container" v-if="barData.datasets[0].data.length > 0">
            <Bar :data="barData" :options="barOptions" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="conclusion-card" shadow="never">
      <el-row align="middle">
        <el-col :sm="24" :md="8" class="code-box">
          <div class="label">您的主导人格型号</div>
          <div class="main-code">{{ primaryType.id }} 号</div>
          <div class="type-name">{{ primaryType.name }}</div>
        </el-col>
        <el-col :sm="24" :md="16" class="code-summary">
          <h3>核心精神画像</h3>
          <p>{{ primaryType.coreDesc }}</p>
          <el-divider border-style="dashed" />
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="fear-box">
                <el-icon><Warning /></el-icon> <strong>深层恐惧：</strong>{{ primaryType.fear }}
              </div>
            </el-col>
            <el-col :span="12">
              <div class="desire-box">
                <el-icon><Star /></el-icon> <strong>核心渴望：</strong>{{ primaryType.desire }}
              </div>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </el-card>

    <div class="dimension-detail-section">
      <h2 class="section-title">🧭 心理动态与成长路径解析</h2>
      <el-row :gutter="20">
        <el-col :xs="24" :md="8">
          <el-card shadow="hover" class="info-card">
            <h4 class="card-title">🕊️ 侧翼特质 (Wing)</h4>
            <p class="desc-text">您的主型号是 {{ primaryType.id }} 号。根据相邻特质得分，您的侧翼偏向 <strong>{{ wingType.id }} 号 ({{ wingType.name }})</strong>。</p>
            <p class="desc-text">这意味着您在基础性格之上，带有 {{ wingType.name }} 的色彩，显得更加：<strong>{{ wingTraits }}</strong>。</p>
          </el-card>
        </el-col>
        <el-col :xs="24" :md="8">
          <el-card shadow="hover" class="info-card success-card">
            <h4 class="card-title">🌱 顺境整合 (Growth)</h4>
            <p class="desc-text">当您处于安全、放松和成长的状态时，您会走向 <strong>{{ primaryType.growth }} 号</strong> 的健康状态。</p>
            <p class="desc-text">您会表现出：{{ primaryType.growthDesc }}。</p>
          </el-card>
        </el-col>
        <el-col :xs="24" :md="8">
          <el-card shadow="hover" class="info-card danger-card">
            <h4 class="card-title">⚡ 逆境解离 (Stress)</h4>
            <p class="desc-text">当您处于极度压力或疲惫状态时，您会退化到 <strong>{{ primaryType.stress }} 号</strong> 的不健康状态。</p>
            <p class="desc-text">您可能会变得：{{ primaryType.stressDesc }}。请将其作为预警信号。</p>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-card class="career-guide-card" shadow="never">
      <template #header><h3 class="m-0" style="color: #0369a1;">💼 职场风格与盲区排查</h3></template>
      <div class="guide-content">
        <div class="guide-item">
          <h4>🌟 领导与协作风格</h4>
          <p>{{ primaryType.workStyle }}</p>
        </div>
        <div class="guide-item">
          <h4>⚠️ 潜在的内耗与盲区</h4>
          <p>{{ primaryType.blindSpot }}</p>
        </div>
        <div class="guide-item">
          <h4>💡 突破瓶颈的建议</h4>
          <p>{{ primaryType.advice }}</p>
        </div>
      </div>
    </el-card>

    <div class="report-footer">
      <p>本报告由专业测评系统自动生成。九型人格是一种极具深度的自我觉察工具，性格无优劣，觉察即成长。</p>
      <el-button type="primary" @click="handlePrint">打印完整PDF报告</el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Radar, Bar } from 'vue-chartjs'
import { Warning, Star } from '@element-plus/icons-vue'
import {
  Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend,
  BarElement, CategoryScale, LinearScale
} from 'chart.js'

ChartJS.register(RadialLinearScale, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const props = defineProps({
  answers: { type: Array, default: () => [] },
  questions: { type: Array, default: () => [] }
})

const sampleId = `EN-${Math.random().toString(36).slice(2, 11).toUpperCase()}`
const currentDate = new Date().toLocaleDateString()

// 九型人格核心数据库 (极高商业价值文案)
const enneagramDB = {
  1: {
    id: 1, name: '完美型 / 改革者', color: '#64748b',
    fear: '害怕自己犯错、变坏或堕落', desire: '证明自己的正确性，追求完美无瑕',
    coreDesc: '您是一位极具原则性、理想主义的人。您内心有一个严厉的法官，时刻要求自己和周围的世界保持高标准。您有强烈的正义感，但容易陷入死板和对不完美的愤怒之中。',
    growth: 7, growthDesc: '变得更加放松、随性、充满活力，接受世界的不完美并享受当下',
    stress: 4, stressDesc: '变得多愁善感、自怨自艾，觉得自己不被理解，陷入情绪的深渊',
    workStyle: '极具责任感，关注细节，致力于建立标准化流程。但可能过于微观管理，让下属感到压力。',
    blindSpot: '强烈的“应该”思维让您难以倾听不同的意见；经常压抑自己的愤怒，最后以冷暴力爆发。',
    advice: '学会在内心说“足够好就行了”。将评判的心转化为宽容，允许自己和他人犯错。'
  },
  2: {
    id: 2, name: '助人型 / 给予者', color: '#ec4899',
    fear: '害怕自己不被爱、不被需要', desire: '被他人需要、被感激、获得爱',
    coreDesc: '您极具同理心、温暖且慷慨。您将注意力完全放在他人身上，善于察觉别人的需求并提供帮助。但这也往往是您获取自我价值感的方式，您可能因此忽略了自己的真实需求。',
    growth: 4, growthDesc: '开始向内看，接纳自己真实的情感，不再单纯为了取悦他人而活',
    stress: 8, stressDesc: '变得咄咄逼人、充满控制欲，认为“我为你付出这么多，你凭什么不听我的”',
    workStyle: '绝佳的团队润滑剂和支持者，擅长客户关系。但容易承担不属于自己的工作而导致职业倦怠。',
    blindSpot: '难以对别人说“不”；通过过度付出建立一种隐性的情感操控和讨好。',
    advice: '记住，你不需要通过照顾别人来换取爱。你的存在本身就是有价值的，请把焦点放回自己身上。'
  },
  3: {
    id: 3, name: '成就型 / 实干者', color: '#f59e0b',
    fear: '害怕自己毫无价值、平庸失败', desire: '获得成功，被他人肯定和钦佩',
    coreDesc: '您是效率极高、充满自信的实干家。您非常懂得如何在这个社会中获取成功，擅长包装自己并达成目标。您极度害怕失败，常常将自己的价值等同于社会地位和工作业绩。',
    growth: 6, growthDesc: '放下虚荣的面具，变得更加忠诚、注重团队协作，为了共同的信仰而非个人面子奋斗',
    stress: 9, stressDesc: '陷入深深的麻木、逃避和冷漠，放弃努力，彻底摆烂',
    workStyle: '极度高效，目标导向，是天生的销售和领导者。但可能为了追求短期业绩而走捷径或牺牲团队利益。',
    blindSpot: '过于关注形象而失去了真实的自我，难以建立深度的亲密关系，因为害怕别人看到你不完美的一面。',
    advice: '停下来问问自己：“如果拿掉我所有的头衔和成就，我还是谁？”学会接纳真实的、平凡的自己。'
  },
  4: {
    id: 4, name: '自我型 / 浪漫主义者', color: '#8b5cf6',
    fear: '害怕自己有缺陷、平庸无奇', desire: '寻找自我，创造独一无二的身份',
    coreDesc: '您是敏感、内省的浪漫主义者。您总觉得自己的灵魂缺少了某块碎片，因此不断地向内寻找。您极度追求独特，情感体验深邃，能够创造出极具美感的事物，但也容易陷入忧郁。',
    growth: 1, growthDesc: '变得客观、自律、有原则，不再被情绪裹挟，而是将创意转化为实际的产出',
    stress: 2, stressDesc: '变得过度依赖他人，疯狂渴望关注和拯救，甚至通过卖惨来获取同情',
    workStyle: '具有极高的原创能力和审美。但情绪化严重，难以适应死板的科层制和常规任务。',
    blindSpot: '沉溺于过去的遗憾或未来的幻想中，拒绝面对当下的现实；觉得“没有人能真正懂我”。',
    advice: '不要等情绪好了才去行动。建立日常的微小纪律，行动本身就能治愈你的情绪内耗。'
  },
  5: {
    id: 5, name: '理智型 / 观察者', color: '#3b82f6',
    fear: '害怕自己无能、无知或被侵入', desire: '掌握知识，理解世界的运作方式',
    coreDesc: '您是深刻、冷峻的思想家。为了避免被外界消耗，您将自己隔离起来，用思想和知识武装大脑。您极度需要私人空间，崇尚逻辑和理性，有时显得冷漠孤僻。',
    growth: 8, growthDesc: '变得勇敢、果断，敢于走出象牙塔，用自己的知识去掌控现实并领导他人',
    stress: 7, stressDesc: '变得分散、急躁，像无头苍蝇一样疯狂抓取各种碎片化信息，无法专注',
    workStyle: '绝佳的分析师和技术专家。独立工作能力极强，但极度反感无意义的会议和过多的人际沟通。',
    blindSpot: '过度囤积知识而不去行动；切断情感连接，导致在亲密关系中显得极其冷血和疏离。',
    advice: '真正的力量不仅在于思考，还在于体验。尝试走出头脑，用身体去感受这个世界，向信任的人敞开心扉。'
  },
  6: {
    id: 6, name: '疑惑型 / 忠诚者', color: '#10b981',
    fear: '害怕失去支持、孤立无援', desire: '获得安全感、指引和确定的依靠',
    coreDesc: '您是谨慎、忠诚的防守者。您的大脑就像一台时刻运行的雷达，不断扫描潜在的危险。您在信任别人之前充满怀疑，但一旦认定，就会展现出极高的忠诚度和责任感。',
    growth: 9, growthDesc: '变得平静、包容，内心不再充满焦虑的噪音，能够真正地信任自己和宇宙',
    stress: 3, stressDesc: '变成工作狂，通过疯狂追求外在成就来掩饰内心的极度恐慌和不安全感',
    workStyle: '极佳的危机管理者和忠诚的执行者。擅长排雷，但容易因为过度焦虑而导致决策瘫痪。',
    blindSpot: '对未来进行灾难化预演，过度放大风险；对权威既依赖又抗拒。',
    advice: '学会区分“真实的危险”和“头脑中想象的危险”。培养内在的勇气，相信自己有能力应对未知。'
  },
  7: {
    id: 7, name: '活跃型 / 享乐主义者', color: '#f97316',
    fear: '害怕被剥夺、陷入痛苦之中', desire: '体验所有美好的事物，保持快乐',
    coreDesc: '您是精力充沛、充满好奇的冒险家。您思维极其发散，害怕错过任何好玩的事情。为了逃避内心的痛苦或无聊，您不断地用新的计划和刺激来填满自己的生活。',
    growth: 5, growthDesc: '变得专注、深刻，能够安静下来深度钻研一个领域，而不再只是走马观花',
    stress: 1, stressDesc: '变得极其苛刻、暴躁，对别人充满评判，死板地要求一切按规矩来',
    workStyle: '天生的头脑风暴专家和开荒者。点子极多，但执行力奇差，极度厌恶收尾工作和日常维护。',
    blindSpot: '用表面的快乐掩盖深层的焦虑；缺乏耐心，遇到困难或需要承担沉重责任时容易习惯性逃避。',
    advice: '停下追逐下一个目标的脚步。学会在枯燥和痛苦中停留，真正的自由包含着自律。'
  },
  8: {
    id: 8, name: '领袖型 / 挑战者', color: '#ef4444',
    fear: '害怕被控制、被伤害或显得软弱', desire: '掌控自己的命运，保护自己的人',
    coreDesc: '您是强大、直接的保护者。您拒绝被任何人控制，总是展现出强势和霸气的一面。您黑白分明，追求公平，敢于直接面对冲突，并为保护弱小而战。',
    growth: 2, growthDesc: '放下铠甲，展露柔软的一面，能够真正用爱和关怀去领导他人，而非仅仅用恐惧',
    stress: 5, stressDesc: '变得极其多疑、孤僻，退缩到暗处策划阴谋，切断与所有人的联系',
    workStyle: '强悍的领导者和开拓者。执行力极强，雷厉风行，但容易因为过于专制和粗暴而压垮下属。',
    blindSpot: '将软弱视为原罪，拒绝承认自己也需要被照顾；用愤怒来掩盖内心的恐惧和悲伤。',
    advice: '脆弱并不等于软弱。只有当你敢于向爱的人展露脆弱时，你才能获得真正深厚的连接。'
  },
  9: {
    id: 9, name: '和平型 / 调停者', color: '#14b8a6',
    fear: '害怕冲突、分离和失去连接', desire: '维持内心的平静与外在的和谐',
    coreDesc: '您是随和、包容的倾听者。您能理解所有人的立场，为了维持和谐，您倾向于压抑自己的真实意见，随波逐流。您内心的口头禅往往是“都行，没关系”。',
    growth: 3, growthDesc: '突然觉醒，爆发出强大的能量和目标感，不再隐形，而是勇敢地追求属于自己的成就',
    stress: 6, stressDesc: '变得极度焦虑、被动防御，不停地抱怨，对任何改变都充满恐慌',
    workStyle: '极佳的团队调和剂。能够让所有人感到舒适，但极度缺乏主动性，面对冲突时往往采用逃避或拖延战术。',
    blindSpot: '通过“麻醉自己”来逃避现实的问题；积累的愤怒往往以极其隐蔽的“被动攻击”方式释放。',
    advice: '你的意见很重要！学会大声说出“我想要什么”。冲突并不一定会导致分离，良性的冲突是解决问题的前提。'
  }
}

// 计算得分
const scores = computed(() => {
  const s = { T1: 0, T2: 0, T3: 0, T4: 0, T5: 0, T6: 0, T7: 0, T8: 0, T9: 0 }
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

const maxScoreValue = computed(() => {
  const max = Math.max(...Object.values(scores.value))
  return max < 5 ? 5 : max + 2
})

// 将 T1~T9 转换为排序数组
const sortedDimensions = computed(() => {
  return [1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => ({
    key: `T${num}`,
    score: scores.value[`T${num}`],
    ...enneagramDB[num]
  })).sort((a, b) => b.score - a.score)
})

const primaryType = computed(() => sortedDimensions.value[0] || enneagramDB[1])

// 计算侧翼 (Wing)
const wingType = computed(() => {
  const mainId = primaryType.value.id
  const leftId = mainId === 1 ? 9 : mainId - 1
  const rightId = mainId === 9 ? 1 : mainId + 1
  
  const leftScore = scores.value[`T${leftId}`]
  const rightScore = scores.value[`T${rightId}`]
  
  if (leftScore >= rightScore) return enneagramDB[leftId]
  return enneagramDB[rightId]
})

const wingTraits = computed(() => {
  if (wingType.value.id === 1) return '有原则、内省'
  if (wingType.value.id === 2) return '热情、关注他人'
  if (wingType.value.id === 3) return '目标导向、自信'
  if (wingType.value.id === 4) return '独特、内向'
  if (wingType.value.id === 5) return '理智、疏离'
  if (wingType.value.id === 6) return '谨慎、忠诚'
  if (wingType.value.id === 7) return '活跃、外向'
  if (wingType.value.id === 8) return '强势、果断'
  if (wingType.value.id === 9) return '包容、随和'
  return ''
})

// 图表数据
const radarData = computed(() => ({
  labels: ['1 完美型', '2 助人型', '3 成就型', '4 自我型', '5 理智型', '6 疑惑型', '7 活跃型', '8 领袖型', '9 和平型'],
  datasets: [{
    label: '内在动机强度',
    data: [1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => scores.value[`T${num}`]),
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderColor: '#6366f1',
    borderWidth: 2,
    pointBackgroundColor: '#6366f1',
    pointBorderColor: '#fff'
  }]
}))

const barData = computed(() => ({
  labels: sortedDimensions.value.map(d => `${d.id} 号`),
  datasets: [{
    label: '人格能量值',
    data: sortedDimensions.value.map(d => d.score),
    backgroundColor: sortedDimensions.value.map(d => d.color + 'cc'),
    borderRadius: 4
  }]
}))

const radarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    r: {
      suggestedMin: 0,
      suggestedMax: maxScoreValue.value,
      ticks: { display: false },
      pointLabels: { font: { size: 12, weight: 'bold' }, color: '#475569' }
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
/* 保持与之前的商业级报告高度一致的样式体系 */
.enneagram-report-container { 
  max-width: 1100px; 
  margin: 0 auto; 
  padding: 10px; 
  color: #1e293b;
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
.type-name { font-size: 1.2rem; font-weight: 700; color: #6366f1; margin-top: 10px; }
.code-box { text-align: center; border-right: 1px solid #e2e8f0; padding-right: 20px; }
.code-summary h3 { margin-top: 0; font-size: 1.4rem; color: #1e293b; }
.code-summary p { font-size: 1.05rem; line-height: 1.7; color: #475569; margin-bottom: 20px; text-align: justify; }

.fear-box, .desire-box { padding: 12px; border-radius: 8px; font-size: 0.95rem; line-height: 1.5; color: #334155; }
.fear-box { background: #fee2e2; border-left: 4px solid #ef4444; }
.desire-box { background: #fef3c7; border-left: 4px solid #f59e0b; }
.fear-box .el-icon { color: #ef4444; margin-right: 5px; }
.desire-box .el-icon { color: #f59e0b; margin-right: 5px; }

.section-title { font-size: 1.6rem; font-weight: 800; text-align: center; margin: 50px 0 30px; color: #0f172a; }

.info-card { border-radius: 12px; height: 100%; border: 1px solid #e2e8f0; }
.success-card { background: #f0fdf4; border-color: #bbf7d0; }
.danger-card { background: #fef2f2; border-color: #fecaca; }
.card-title { font-size: 1.15rem; font-weight: 700; margin: 0 0 15px 0; color: #1e293b; }
.desc-text { font-size: 0.95rem; color: #475569; line-height: 1.6; margin: 0 0 10px 0; text-align: justify; }

.career-guide-card { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 16px; margin-top: 40px; }
.guide-item { margin-bottom: 20px; }
.guide-item:last-child { margin-bottom: 0; }
.guide-item h4 { color: #0369a1; margin: 0 0 8px 0; font-size: 1.1rem; font-weight: 700; }
.guide-item p { color: #334155; line-height: 1.6; margin: 0; text-align: justify; }

.report-footer { text-align: center; margin-top: 60px; padding: 40px 0; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 0.9rem; }
.report-footer p { margin-bottom: 20px; }

@media print {
  .report-footer .el-button { display: none; }
  .chart-dashboard { display: flex !important; }
  .enneagram-report-container { max-width: 100%; padding: 0; }
  .chart-card { border: 1px solid #ccc !important; box-shadow: none !important; }
}

@media (max-width: 768px) {
  .chart-dashboard .el-col { margin-bottom: 20px; }
  .code-box { border-right: none; border-bottom: 1px solid #e2e8f0; padding-right: 0; padding-bottom: 20px; margin-bottom: 20px; }
  .info-card { margin-bottom: 20px; }
}
</style>