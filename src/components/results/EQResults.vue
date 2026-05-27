<template>
  <div class="eq-results-container">
    <div class="print-header">
      <div class="print-logo">综合情商 (EQ) 深度测评报告</div>
      <div>生成日期: {{ currentDate }}</div>
    </div>

    <div class="header-section">
      <h2 class="title">情商 (Emotional Quotient) 深度评估报告</h2>
      <p class="subtitle">
        本报告依据丹尼尔·戈尔曼 (Daniel Goleman) 的情绪智力模型，从自我认知、自我管理、社会认知与关系管理四个核心维度为您提供详尽的解析，助您在职场与人际交往中更加游刃有余。
      </p>
    </div>

    <div class="top-overview card-box">
      <div class="score-overview">
        <div class="eq-score-circle">
          <div class="score-number">{{ totalScore }}</div>
          <div class="score-label">EQ 总分</div>
        </div>
        <div class="level-info">
          <h2 class="eq-level">评估等级：{{ eqLevel.title }}</h2>
          <p class="eq-description">{{ eqLevel.description }}</p>
        </div>
      </div>
      
      <div class="radar-chart-container">
        <Radar :data="chartData" :options="chartOptions" v-if="chartData.datasets.length > 0" />
      </div>
    </div>

    <div class="dimensions-section">
      <h3 class="section-title">四大核心维度深度剖析</h3>
      <p class="section-intro">以下是您在情商四个关键领域的具体表现。我们不仅提供了得分，还为您在职场和生活中的表现进行了详尽解读。</p>
      
      <div class="grid">
        <div v-for="dim in dimensionDetails" :key="dim.name" class="dimension-card card-box">
          <div class="dim-header">
            <div class="dim-icon">{{ dim.icon }}</div>
            <div class="dim-title">
              <h4>{{ dim.name }}</h4>
              <span class="dim-en">{{ dim.nameEn }}</span>
            </div>
            <div class="dim-score">
              <span class="score-val">{{ dim.score }}</span>
              <span class="score-max">/ {{ dim.maxScore }}</span>
            </div>
          </div>
          
          <div class="bar-container">
            <div class="bar-bg">
              <div class="bar-fill" :style="{ width: (dim.score / dim.maxScore) * 100 + '%' }"></div>
            </div>
          </div>

          <div class="interpretation">
            <div class="detail-block">
              <strong>📌 核心表现：</strong>
              <p>{{ dim.analysis.core }}</p>
            </div>
            <div class="detail-block">
              <strong>💼 职场应用：</strong>
              <p>{{ dim.analysis.work }}</p>
            </div>
            <div class="detail-block warning">
              <strong>⚠️ 提升空间：</strong>
              <p>{{ dim.analysis.blindSpot }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="detailed-analysis card-box">
      <h3 class="section-title">您的综合情商画像</h3>
      <div class="analysis-content">
        <div class="strengths">
          <h4>🌟 您的核心优势</h4>
          <ul>
            <li v-for="strength in eqLevel.strengths" :key="strength">{{ strength }}</li>
          </ul>
        </div>
        
        <div class="improvements">
          <h4>📈 进阶发展路径</h4>
          <ul>
            <li v-for="improvement in eqLevel.improvements" :key="improvement">{{ improvement }}</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="eq-tips card-box">
      <h3 class="section-title">🚀 每日情商提升行动指南</h3>
      <div class="tips-grid">
        <div class="tip-card" v-for="tip in actionTips" :key="tip.title">
          <div class="tip-icon">{{ tip.icon }}</div>
          <h4>{{ tip.title }}</h4>
          <p>{{ tip.desc }}</p>
        </div>
      </div>
    </div>

    <div class="print-footer">
      <p>本测评基于国际权威情商理论编制，报告内容由系统自动生成，拥有专属版权。</p>
      <p>高情商并非天生，而是通过后天不断练习获得的技能。祝您在自我成长的道路上越走越远！</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js'
import { Radar } from 'vue-chartjs'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const props = defineProps({
  answers: { type: Array, default: () => [] },
  questions: { type: Array, default: () => [] },
  testType: String
})

const currentDate = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
})

// 计算各维度得分
const rawDimensionScores = computed(() => {
  const scores = { '自我认知': 0, '自我管理': 0, '社会认知': 0, '关系管理': 0 }
  const maxScores = { '自我认知': 0, '自我管理': 0, '社会认知': 0, '关系管理': 0 }
  
  props.answers.forEach((answer, index) => {
    if (answer && answer.scoring) {
      Object.keys(answer.scoring).forEach(dim => {
        if (scores[dim] !== undefined) scores[dim] += answer.scoring[dim]
      })
    }
    
    if (props.questions[index] && props.questions[index].options) {
      props.questions[index].options.forEach(option => {
        if (option.scoring) {
          Object.keys(option.scoring).forEach(dim => {
            if (maxScores[dim] !== undefined) {
              maxScores[dim] = Math.max(maxScores[dim], option.scoring[dim] || 0)
            }
          })
        }
      })
    }
  })
  
  Object.keys(maxScores).forEach(key => {
    if (maxScores[key] === 0) maxScores[key] = Math.max(props.questions.length * 3, 10)
  })
  
  return { scores, maxScores }
})

const totalScore = computed(() => Object.values(rawDimensionScores.value.scores).reduce((a, b) => a + b, 0))
const maxTotalScore = computed(() => Object.values(rawDimensionScores.value.maxScores).reduce((a, b) => a + b, 0))

// 雷达图数据
const chartData = computed(() => {
  const labels = ['自我认知', '自我管理', '社会认知', '关系管理']
  const data = labels.map(label => {
    const s = rawDimensionScores.value.scores[label]
    const m = rawDimensionScores.value.maxScores[label]
    return m ? Math.round((s / m) * 100) : 0
  })

  return {
    labels: labels,
    datasets: [{
      label: '情商维度分布',
      backgroundColor: 'rgba(16, 185, 129, 0.2)', // 绿色基调
      borderColor: 'rgba(16, 185, 129, 1)',
      pointBackgroundColor: 'rgba(16, 185, 129, 1)',
      pointBorderColor: '#fff',
      data: data
    }]
  }
})

const chartOptions = {
  responsive: true, maintainAspectRatio: false,
  scales: { r: { suggestedMin: 0, suggestedMax: 100, ticks: { display: false } } },
  plugins: { legend: { display: false } }
}

// 细粒度的维度解析文案字典
const dimensionDict = {
  '自我认知': {
    nameEn: 'Self-Awareness',
    icon: '🔍',
    high: {
      core: '您拥有极高的自我觉察力。能够清晰地识别自己当下的情绪状态，了解这些情绪产生的原因，并深刻明白自己的优势和局限。您不会轻易被情绪绑架，因为您总能第一时间“看到”它们。',
      work: '在职场中，您表现出难得的清醒与自信。您知道自己擅长什么，也勇于承认自己不擅长的领域。这种通透让您在面临复杂决策时，不会被个人的偏见或一时的情绪波动所左右。',
      blindSpot: '有时过度向内审视可能会导致轻微的“精神内耗”。在觉察到负面情绪后，不必总是试图立刻根除它，学会与之共处也是一种智慧。'
    },
    mid: {
      core: '您具备良好的基本自我认知。在大多数平静的时刻，您清楚自己的感受和需求；但在突发或强烈的情绪冲击下，您可能需要事后回想才能明白当时到底怎么了。',
      work: '您能够客观评估自己的工作表现，接受建设性的批评。但在面临重大职场挫折时，可能会短暂地产生自我怀疑，需要一定时间来重建自信。',
      blindSpot: '在压力激增时，您可能会忽视身体发出的警告信号（如疲劳、烦躁）。建议建立定期的“自我情绪复盘”机制，不要等到情绪爆发才去关注它。'
    },
    low: {
      core: '目前您在情绪觉察方面还有较大的探索空间。您可能经常感到“莫名其妙的心烦”或“说不上来的不开心”，难以精准地命名自己正在经历的情绪，导致情绪常常像一团迷雾。',
      work: '在工作中，您可能较难意识到自己的言行正在如何影响着整个团队的氛围。有时对他人的反馈感到困惑，甚至会因为没有察觉到自己的防御心理而错失成长的机会。',
      blindSpot: '缺乏自我认知是情绪失控的根源。如果您不知道自己为什么生气，就无法真正解决问题。建议从每天记录“情绪日记”开始，强迫自己写下当天的具体感受。'
    }
  },
  '自我管理': {
    nameEn: 'Self-Management',
    icon: '🧭',
    high: {
      core: '您是情绪的“主理人”而非“奴隶”。即使面对巨大的压力或挑衅，您也能保持理智，克制破坏性的冲动。您具备极强的适应能力和乐观精神，能迅速从挫折中恢复。',
      work: '您是团队中极其可靠的稳定器。在危机时刻，您的冷静能迅速稳定军心；在面对艰巨挑战时，您强大的内在驱动力让您能够持续保持高效产出，不轻言放弃。',
      blindSpot: '过强的自我控制有时会让您显得过于“克制”和“完美”，甚至压抑了部分真实的、需要宣泄的情感。偶尔展示脆弱，也是一种强大的力量。'
    },
    mid: {
      core: '您能够掌控日常的绝大多数情绪波动，但在面对触及底线的人或事时，偶尔也会有情绪失控的时刻。您懂得调整心态，但恢复周期可能因事件的大小而异。',
      work: '您能够按时推进项目，但在遇到极度不配合的同事或不合理的客户要求时，可能会表现出明显的沮丧或不耐烦。您需要更多的外部环境支持来维持最佳状态。',
      blindSpot: '在长期的慢性压力下，您的情绪管理系统可能会逐渐过载。建议您学习更多元化的释压技巧，如正念冥想或剧烈运动，以防止“压力爆雷”。'
    },
    low: {
      core: '您的情绪往往走在理智前面。冲动、易怒或容易被焦虑吞噬是您目前面临的挑战。您可能会因为一时的情绪失控而做出事后后悔的决定。',
      work: '在职场中，您可能因为无法控制情绪而在关键时刻展现出不专业的一面，这会严重影响他人对您能力和可靠性的评价，阻碍您的职业晋升。',
      blindSpot: '任由情绪发泄不仅会破坏人际关系，还会对您的身心健康造成伤害。当感觉到情绪即将爆发时，请务必执行“黄金6秒法则”——深呼吸并在心里默数6秒后再开口。'
    }
  },
  '社会认知': {
    nameEn: 'Social Awareness',
    icon: '📡',
    high: {
      core: '您拥有雷达般敏锐的同理心和同情心。您不仅能听懂别人嘴上说的话，更能精准捕捉到对方的微表情、肢体语言和言外之意。您能迅速感知到一个群体中的情绪氛围和权力动态。',
      work: '您是天生的服务者和领导者。在跨部门沟通或客户谈判中，您总能敏锐地察觉到对方的真实需求和顾虑，从而提出最能打动对方的解决方案。',
      blindSpot: '极高的共情能力可能会让您承受“同情疲劳（Compassion Fatigue）”。过度吸收他人的负面情绪会消耗您的精力，您必须学会划定情绪边界。'
    },
    mid: {
      core: '您具备基本的换位思考能力。在与他人进行一对一的深入交流时，您能很好地理解对方的感受；但在复杂或陌生的人际环境中，您可能无法迅速读懂空气。',
      work: '您能与熟悉的团队成员保持良好的默契，但在面对文化背景不同或性格迥异的人时，可能会偶尔出现沟通错位，需要更多的时间去磨合。',
      blindSpot: '有时您可能会因为主观臆断而误解他人的意图。建议在做出回应前，多用“你的意思是……对吗？”这样的句式进行确认，减少沟通成本。'
    },
    low: {
      core: '您更习惯于从自己的视角出发看世界，有时难以体会他人的难处。您可能常常觉得别人“想太多”或“太敏感”，忽略了人际交往中微妙的情感连接。',
      work: '在团队协作中，您可能因为显得过于冷漠或只关注任务本身，而让同事感到缺乏人情味。这可能导致您在推动需要大家齐心协力的项目时遇到隐性阻力。',
      blindSpot: '缺乏社会认知会让您在组织中被边缘化。请尝试在每次交流时，花20%的精力去关注对方的语气和表情，学会阅读言语之外的信息。'
    }
  },
  '关系管理': {
    nameEn: 'Relationship Management',
    icon: '🤝',
    high: {
      core: '您是建立和维护人际关系的大师。您擅长清晰地表达自己，能够运用幽默和同理心化解冲突。您不仅能与他人建立深厚的信任，还能有效地激励和影响周围的人。',
      work: '您具备卓越的领导潜力。您能在团队中营造出心理安全的氛围，让每个人都愿意发挥所长。在处理职场冲突时，您总能找到双赢的解决方案，而非制造对立。',
      blindSpot: '为了维持长期的和谐关系，您可能会在某些需要做出冷酷商业决断的时刻犹豫不决。请记住，真正的关系管理也包括有技巧地传达坏消息。'
    },
    mid: {
      core: '您能维持良好的人际网络，但在处理高难度的对话（如拒绝他人、提出批评或面对冲突）时，可能会感到不适或选择回避。',
      work: '您是优秀的团队成员，但在需要主导谈判或协调复杂利益冲突时，可能会显得手段不足。您倾向于维持现状，而不是主动去修复已经产生裂痕的关系。',
      blindSpot: '回避冲突并不会让冲突消失。建议您学习“非暴力沟通”技巧，学会在表达真实需求的同时不伤害对方的感情，勇敢面对必要的艰难对话。'
    },
    low: {
      core: '目前人际关系对您来说可能是一个充满挑战和消耗的领域。您可能经常发现自己陷入无谓的争吵，或者感到自己被他人孤立和误解，难以建立长期稳定的信任关系。',
      work: '缺乏关系管理能力会让您的才华难以施展。您的硬技能可能很强，但因为无法有效合作或频繁与同事发生摩擦，导致您的整体绩效大打折扣。',
      blindSpot: '人际关系的破裂往往源于糟糕的沟通习惯（如指责、嘲讽、冷战）。请从停止使用“你总是……”或“你从不……”这种绝对化语言开始改变。'
    }
  }
}

// 整合维度得分与深度解析
const dimensionDetails = computed(() => {
  const dims = ['自我认知', '自我管理', '社会认知', '关系管理']
  return dims.map(name => {
    const score = rawDimensionScores.value.scores[name]
    const maxScore = rawDimensionScores.value.maxScores[name]
    const pct = maxScore ? score / maxScore : 0
    const dict = dimensionDict[name]
    
    let analysis = dict.low
    if (pct >= 0.75) analysis = dict.high
    else if (pct >= 0.45) analysis = dict.mid

    return {
      name,
      nameEn: dict.nameEn,
      icon: dict.icon,
      score,
      maxScore,
      analysis
    }
  })
})

// 宏观等级评估 (大幅扩充文案)
const eqLevel = computed(() => {
  const percentage = maxTotalScore.value ? (totalScore.value / maxTotalScore.value) * 100 : 0
  
  if (percentage >= 80) {
    return {
      title: '高情商 (卓越的变革者)',
      description: '您展现出了极其卓越的情感智力。您不仅能精准地管理自己的内心秩序，更能在复杂的人际网络中游刃有余。这种稀缺的能力是您在职场和生活中获取成功的核心竞争力。',
      strengths: [
        '极高的自我透明度，不被负面情绪裹挟。',
        '在巨大压力下依然能做出理智且兼顾人情的决策。',
        '具备敏锐的同理心，能轻易察觉他人的未言之需。',
        '高超的冲突化解能力，擅长将对立转化为合作。',
        '天生的影响力，能潜移默化地激励和领导团队。'
      ],
      improvements: [
        '尝试担任导师角色，将您的情商技巧传授给他人。',
        '在极度共情的同时，注意建立情绪防火墙，避免精神枯竭。',
        '挑战更复杂的跨文化或高利益冲突的谈判场景。'
      ]
    }
  } else if (percentage >= 60) {
    return {
      title: '中高情商 (稳健的协作者)',
      description: '您的情商处于健康且良好的水平。您已经掌握了基本的情绪调节技巧，并在日常人际交往中表现得通情达理。只要在关键压力节点加以注意，您就能做得更好。',
      strengths: [
        '能准确识别日常情绪，不易发生极端失控。',
        '具备换位思考的基础能力，理解多数人的立场。',
        '在和谐的环境中能发挥极佳的协作精神。',
        '愿意倾听他人，沟通方式温和且具有建设性。'
      ],
      improvements: [
        '提升在极端压力下的情绪恢复速度（Resilience）。',
        '练习“非暴力沟通”，勇敢面对而非回避必然的冲突。',
        '尝试更敏锐地捕捉非言语信息（如微表情、肢体动作）。',
        '学习在拒绝他人时如何做到“温和而坚定”。'
      ]
    }
  } else if (percentage >= 40) {
    return {
      title: '中等情商 (潜力的探索者)',
      description: '您的情商水平处于大众平均区间。您在情绪处理上时好时坏，某些场景下您能应对自如，但在触发到某些特定敏感点时，可能会显得手足无措或应对生硬。',
      strengths: [
        '对自己的基本情绪反应有一定的认知框架。',
        '在熟悉的安全区内，能维持良好的人际互动。',
        '内心具备成长意愿，意识到改变的必要性。'
      ],
      improvements: [
        '停止“情绪压抑”，学会为自己的情绪准确命名。',
        '在开口回应刺激之前，强制自己执行“黄金6秒缓冲”。',
        '在团队合作中，刻意去关注和询问同事的感受，而不仅仅是进度。',
        '阅读心理学书籍，建立关于情绪管理的基础理论框架。'
      ]
    }
  } else {
    return {
      title: '待提升情商 (觉醒的起点)',
      description: '目前，情绪可能是您生活中经常引发麻烦的源头。无论是情绪的暴风雨还是人际的冷战，都在消耗您的精力。但这并不是终点，意识到这一点本身就是巨大的进步。',
      strengths: [
        '您迈出了极其勇敢的第一步：直面测评并看到了自己的短板。',
        '一旦掌握方法，您的提升空间将是所有人群中最巨大的。'
      ],
      improvements: [
        '第一步：从写“情绪日记”开始，不再逃避，直面自己的愤怒或焦虑。',
        '第二步：学习倾听，与人交谈时，不要打断，不要急于反驳。',
        '第三步：当情绪上头时，物理离开现场，避免做出不可挽回的决定。',
        '考虑寻求专业的心理辅导或参加情商训练营，获取系统性支持。'
      ]
    }
  }
})

const actionTips = [
  { icon: '📝', title: '情绪命名练习', desc: '不要只说“我感觉不好”。尝试精确描述，是“沮丧”、“嫉妒”还是“焦虑”？精确命名是掌控情绪的第一步。' },
  { icon: '⏸️', title: '六秒钟法则', desc: '在感到愤怒或受到刺激准备反击时，深呼吸，在心里默数六秒。理智往往只需要这六秒钟就能追赶上冲动。' },
  { icon: '👂', title: '最高级倾听', desc: '倾听不是为了等待轮到自己说话。试着完全放下防备，用同理心去理解对方语言背后的情绪和未被满足的需求。' },
  { icon: '🛡️', title: '课题分离', desc: '认清什么是别人的情绪，什么是自己的责任。不要把别人的愤怒归咎于自己，也不要指望别人为你的快乐负责。' }
]
</script>

<style scoped>
/* =========== 基础排版 =========== */
.eq-results-container {
  color: #334155;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem;
}

.card-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 2.5rem 2rem;
  margin-bottom: 2.5rem;
  box-shadow: 0 4px 15px -3px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-top: 0;
  margin-bottom: 1rem;
  border-bottom: 2px solid #f1f5f9;
  padding-bottom: 1rem;
}

.section-intro {
  color: #64748b;
  margin-bottom: 2rem;
  font-size: 1.05rem;
  line-height: 1.6;
}

/* =========== 头部 & 综合预览 =========== */
.header-section { text-align: center; margin-bottom: 3rem; }
.title { font-size: 2.2rem; font-weight: 800; color: #10b981; margin-bottom: 1rem; }
.subtitle { color: #64748b; font-size: 1.05rem; line-height: 1.8; max-width: 750px; margin: 0 auto; }

.top-overview {
  display: flex;
  align-items: center;
  gap: 3rem;
}
.score-overview { flex: 1; text-align: center; }
.eq-score-circle {
  width: 140px; height: 140px; border-radius: 50%;
  background: linear-gradient(135deg, #10b981, #059669);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  margin: 0 auto 1.5rem; box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3); color: white;
}
.score-number { font-size: 3rem; font-weight: 800; line-height: 1; margin-bottom: 0.2rem; }
.score-label { font-size: 1rem; font-weight: 600; opacity: 0.9; }

.eq-level { font-size: 1.5rem; font-weight: 700; color: #10b981; margin-bottom: 0.8rem; }
.eq-description { color: #475569; line-height: 1.6; font-size: 1.05rem; text-align: justify; }

.radar-chart-container { flex: 1; height: 320px; width: 100%; max-width: 400px; }

/* =========== 四大维度卡片 =========== */
.grid { display: flex; flex-direction: column; gap: 2rem; }
.dimension-card { padding: 2rem; margin-bottom: 0; border: 1px solid #d1fae5; }

.dim-header { display: flex; align-items: center; gap: 1.2rem; margin-bottom: 1.5rem; }
.dim-icon { font-size: 2.5rem; }
.dim-title { flex: 1; }
.dim-title h4 { margin: 0; font-size: 1.3rem; color: #1e293b; font-weight: 800; }
.dim-en { font-size: 0.85rem; color: #94a3b8; text-transform: uppercase; font-weight: 600; }
.dim-score { text-align: right; }
.score-val { font-size: 1.8rem; font-weight: 800; color: #059669; }
.score-max { color: #94a3b8; font-size: 1rem; }

.bar-container { margin-bottom: 1.8rem; }
.bar-bg { height: 12px; background: #e2e8f0; border-radius: 999px; overflow: hidden; }
.bar-fill { height: 100%; background: #10b981; border-radius: 999px; transition: width 1s ease; }

.interpretation .detail-block { margin-bottom: 1.2rem; }
.interpretation .detail-block strong { display: block; font-size: 1.05rem; color: #1e293b; margin-bottom: 0.4rem; }
.interpretation .detail-block p { margin: 0; color: #475569; line-height: 1.7; font-size: 0.98rem; text-align: justify; }
.interpretation .detail-block.warning p { color: #b45309; background: #fffbeb; padding: 0.8rem 1rem; border-radius: 8px; border-left: 3px solid #f59e0b; }

/* =========== 优势与建议 =========== */
.analysis-content { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
.strengths, .improvements { background: #f8fafc; padding: 1.8rem; border-radius: 12px; }
.strengths { border-left: 4px solid #10b981; }
.improvements { border-left: 4px solid #3b82f6; }
.analysis-content h4 { font-size: 1.15rem; margin-top: 0; margin-bottom: 1.2rem; color: #1e293b; }
.analysis-content ul { list-style: none; padding: 0; margin: 0; }
.analysis-content li { position: relative; padding-left: 1.5rem; margin-bottom: 0.8rem; color: #475569; line-height: 1.6; }
.analysis-content li::before { content: "✓"; position: absolute; left: 0; font-weight: bold; }
.strengths li::before { color: #10b981; }
.improvements li::before { color: #3b82f6; content: "→"; }

/* =========== 小贴士 =========== */
.tips-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; }
.tip-card { background: #f8fafc; padding: 1.5rem; border-radius: 12px; text-align: center; border: 1px solid #e2e8f0; transition: transform 0.2s; }
.tip-card:hover { transform: translateY(-3px); border-color: #10b981; }
.tip-icon { font-size: 2rem; margin-bottom: 0.8rem; }
.tip-card h4 { margin: 0 0 0.5rem 0; color: #1e293b; font-size: 1.05rem; }
.tip-card p { margin: 0; font-size: 0.9rem; color: #64748b; line-height: 1.5; }

/* =========== 响应式 & 打印 =========== */
@media (max-width: 768px) {
  .top-overview { flex-direction: column; gap: 2rem; }
  .radar-chart-container { height: 300px; }
  .analysis-content { grid-template-columns: 1fr; }
  .card-box { padding: 1.5rem; }
}

.print-header, .print-footer { display: none; }

@media print {
  @page { size: A4; margin: 15mm; }
  body, .eq-results-container { background: white !important; color: #000 !important; }
  .print-header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 30px; font-weight: bold; }
  .print-footer { display: block; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center; font-size: 12px; color: #666; }
  .card-box { border: none; box-shadow: none; padding: 0; margin-bottom: 40px; }
  .dimension-card { page-break-inside: avoid; }
  .eq-score-circle { color: #000; background: none; border: 4px solid #10b981; box-shadow: none; }
  .score-number, .score-label { color: #000; }
  .detail-block.warning p { background: none; border: 1px solid #fcd34d; border-left: 3px solid #f59e0b; color: #000; }
  .strengths, .improvements { background: none; border: 1px solid #e2e8f0; }
  .bar-bg { background: #e2e8f0; border: 1px solid #cbd5e1; }
  .bar-fill { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .radar-chart-container { height: 350px; }
}
</style>