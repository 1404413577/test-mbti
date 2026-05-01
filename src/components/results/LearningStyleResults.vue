<template>
  <div class="learning-style-results">
    <div class="print-header">
      <div class="print-logo">VARK 学习风格深度诊断报告</div>
      <div>生成日期: {{ currentDate }}</div>
    </div>

    <div class="header-section">
      <h2 class="title">学习风格 (VARK) 深度诊断报告</h2>
      <p class="subtitle">
        基于经典 VARK 学习风格模型，本报告将通过多维数据可视化，揭示您大脑吸收信息的最佳“带宽”通道。不仅告诉您怎么学最快，更为您规划专属的黄金学习时序。
      </p>
    </div>

    <div class="top-overview card-box">
      <div class="primary-style-highlight">
        <div class="style-icon-large">{{ primaryStyle.icon }}</div>
        <h3 class="highlight-title">您的主导学习风格</h3>
        <h2 class="style-name" :style="{ color: primaryStyle.color }">{{ primaryStyle.name }}</h2>
        <p class="style-description">{{ primaryStyle.description }}</p>
        <div class="score-badge" :style="{ backgroundColor: primaryStyle.color }">
          主导倾向得分：{{ primaryStyleScore }} 分
        </div>
      </div>
      
      <div class="radar-chart-container">
        <h4 class="chart-title">🧠 学习通道偏好雷达图</h4>
        <Radar :data="radarChartData" :options="radarChartOptions" v-if="radarChartData.datasets.length > 0" />
      </div>
    </div>

    <div class="efficiency-section card-box">
      <h3 class="section-title">⏱️ 专属高效学习流 (Flow)</h3>
      <p class="section-intro">不同学习风格的人，其大脑的专注力留存曲线完全不同。以下是系统为您主导风格量身定制的动态分析：</p>
      
      <div class="efficiency-grid">
        <div class="line-chart-wrapper">
          <h4 class="chart-title">📈 60分钟专注力留存曲线</h4>
          <div class="line-chart-container">
            <LineChart :data="lineChartData" :options="lineChartOptions" v-if="lineChartData.datasets.length > 0" />
          </div>
          <p class="chart-tip">{{ primaryStyle.curveDesc }}</p>
        </div>

        <div class="timeline-wrapper">
          <h4 class="chart-title">⏳ 黄金一小时学习时序建议</h4>
          <div class="custom-timeline">
            <div class="timeline-item" v-for="(step, index) in primaryStyle.timeline" :key="index">
              <div class="timeline-marker" :style="{ backgroundColor: primaryStyle.color }"></div>
              <div class="timeline-content">
                <div class="time-label" :style="{ color: primaryStyle.color }">{{ step.time }}</div>
                <h5 class="step-title">{{ step.title }}</h5>
                <p class="step-desc">{{ step.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="dimensions-section">
      <h3 class="section-title">📊 各学习通道能力全景扫描</h3>
      <div class="grid">
        <div v-for="dim in allStyles" :key="dim.type" class="dimension-card card-box" :class="{ 'is-primary': dim.type === primaryStyleType }">
          
          <div class="dim-header">
            <div class="dim-icon">{{ dim.icon }}</div>
            <div class="dim-title">
              <h4>{{ dim.name }}</h4>
              <span class="dim-en">{{ dim.nameEn }}</span>
            </div>
            <div class="dim-score">
              <span class="score-val" :style="{ color: dim.color }">{{ getStyleScore(dim.type) }}</span>
              <span class="score-max">/ {{ maxScoreObj[dim.nameZh] || 60 }}</span>
            </div>
          </div>
          
          <div class="bar-container">
            <div class="bar-bg">
              <div class="bar-fill" :style="{ width: getPercentage(getStyleScore(dim.type), maxScoreObj[dim.nameZh] || 60) + '%', backgroundColor: dim.color }"></div>
            </div>
          </div>

          <div class="interpretation">
            <div class="detail-block">
              <strong>🎯 认知特征：</strong>
              <p>{{ dim.analysis.core }}</p>
            </div>
            <div class="detail-block">
              <strong>🏫 校园/考证场景：</strong>
              <p>{{ dim.analysis.academic }}</p>
            </div>
            <div class="detail-block">
              <strong>💼 职场应用场景：</strong>
              <p>{{ dim.analysis.work }}</p>
            </div>
            <div class="detail-block warning">
              <strong>⚠️ 效率盲区：</strong>
              <p>{{ dim.analysis.blindSpot }}</p>
            </div>
          </div>

          <div class="advice-box" :style="{ borderLeftColor: dim.color }">
            <h4 :style="{ color: dim.color }">💡 极速提升策略</h4>
            <ul class="tips">
              <li v-for="(tip, index) in dim.tips" :key="index">{{ tip }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="learning-tools card-box">
      <h3 class="section-title">🛠️ 专属数字化学习兵器库</h3>
      <p class="section-intro">工欲善其事，必先利其器。基于您的主导风格，我们强烈推荐以下工具来构建您的个人知识库：</p>
      <div class="tools-grid">
        <div v-for="tool in recommendedTools" :key="tool.name" class="tool-card">
          <div class="tool-icon">{{ tool.icon }}</div>
          <h4>{{ tool.name }}</h4>
          <p>{{ tool.description }}</p>
        </div>
      </div>
    </div>

    <div class="print-footer">
      <p>本测评基于 VARK 学习理论编制，报告内容由系统自动生成，拥有专属版权。</p>
      <p>掌握自己的学习风格，是实现终身学习和知识复利的终极捷径。</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  Chart as ChartJS,
  RadialLinearScale,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js'
import { Radar, Line as LineChart } from 'vue-chartjs'

ChartJS.register(RadialLinearScale, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const props = defineProps({
  answers: Array,
  questions: Array,
  testType: String
})

const currentDate = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
})

// 计算得分与最大分
const dimensionScores = computed(() => {
  const scores = { '视觉学习': 0, '听觉学习': 0, '阅读写作': 0, '动觉学习': 0 }
  const maxScores = { '视觉学习': 0, '听觉学习': 0, '阅读写作': 0, '动觉学习': 0 }
  
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
            if (maxScores[dim] !== undefined) maxScores[dim] = Math.max(maxScores[dim], option.scoring[dim] || 0)
          })
        }
      })
    }
  })
  
  Object.keys(maxScores).forEach(key => { if (maxScores[key] === 0) maxScores[key] = Math.max(props.questions.length * 3, 20) })
  return { scores, maxScores }
})

const maxScoreObj = computed(() => dimensionScores.value.maxScores)

const getPercentage = (score, max) => Math.min(Math.max(Math.round((score / max) * 100), 0), 100)

// 深度构建各风格的专业文案与图表数据
const allStyles = [
  {
    type: 'visual', nameZh: '视觉学习', name: '视觉型学习者', nameEn: 'Visual Learner', icon: '👁️', color: '#8b5cf6',
    description: '您是“图像思维”的大师。大脑对色彩、排版、图表和空间关系的捕捉速度远超文字和声音。一图胜千言是您的真实写照。',
    curveDesc: '视觉型学习者的专注力在最初接触新图像时极高，随着视觉刺激变弱会缓慢下降，但在重新排版或画图时会再次激发。',
    retentionData: [95, 90, 80, 75, 85, 95, 90], // 折线图数据
    timeline: [
      { time: '0-10 Min', title: '全局扫描', desc: '快速浏览目录、标题和插图，在脑海中建立知识的骨架与空间结构。' },
      { time: '10-40 Min', title: '色彩编码', desc: '深入阅读，并使用至少3种不同颜色的荧光笔或记号笔对核心概念进行高亮和连接。' },
      { time: '40-50 Min', title: '视觉重构', desc: '闭上眼睛回忆，然后在一张白纸上画出刚刚所学的思维导图或概念关联图。' },
      { time: '50-60 Min', title: '图像复习', desc: '只看自己画的思维导图，尝试在脑海中补全细节。' }
    ],
    analysis: {
      core: '您倾向于用“看”来理解世界。对于冗长的口头汇报会感到不耐烦，但面对复杂的数据图表却能迅速找到规律。您记忆东西时，往往记住了它在书本左上角还是右下角，或者是它的颜色。',
      academic: '在考研、考证等大量记忆的场景中，纯背诵文字对您来说效率极低。您需要把知识点变成图。看到老师板书的结构比听老师念PPT有用得多。',
      work: '在职场上，您是出色的PPT制作者、数据可视化专家或UI/UX评判者。当需要向您汇报工作时，最好的方式是给您看Dashboard或流程图，而不是长篇大论。',
      blindSpot: '如果参加没有视觉辅助的纯语音会议（如电话会议），您极易走神并遗漏重要信息。'
    },
    tips: [
      '将所有复杂的文字段落转换为流程图、树状图或时间线。',
      '建立自己的色彩编码系统（如：红色代表概念，蓝色代表例子，绿色代表考点）。',
      '开会或上课时一定要坐在前排，确保能清晰看到屏幕或板书，减少视觉干扰。'
    ]
  },
  {
    type: 'auditory', nameZh: '听觉学习', name: '听觉型学习者', nameEn: 'Auditory Learner', icon: '👂', color: '#3b82f6',
    description: '您是“声音捕捉”的高手。节奏、语调和口头讨论是您打开记忆闸门的钥匙。通过“听”和“说”，您的思维能达到最活跃的状态。',
    curveDesc: '听觉型学习者需要较长的预热期，在进入对话和讨论状态时专注力达到顶峰，但容易被环境噪音打断。',
    retentionData: [60, 75, 90, 95, 85, 90, 80],
    timeline: [
      { time: '0-15 Min', title: '有声输入', desc: '听音频课程或大声朗读教材，让声音刺激大脑的听觉皮层。' },
      { time: '15-35 Min', title: '口头推演', desc: '放下书本，假装面前有一个学生，用自己的话把刚才的内容口头讲授一遍。' },
      { time: '35-45 Min', title: '讨论答疑', desc: '与学习伙伴探讨，或者在脑海中进行自我辩论（“为什么这个定理是成立的？”）。' },
      { time: '45-60 Min', title: '录音总结', desc: '打开手机录音机，用3分钟口头总结今天的核心收获，留作日后复习。' }
    ],
    analysis: {
      core: '您对声音极其敏感，能够轻易记住一首歌的旋律或别人说过的一句原话。您在思考复杂问题时，常常会不自觉地自言自语。',
      academic: '在学校里，您是那种“上课只要认真听讲，下课不怎么做题也能考好”的类型。录音笔和播客是您复习的最佳伴侣。',
      work: '在职场中，您是极佳的沟通者和谈判者。您能从客户语气的微弱变化中察觉到真实的意图。比起看长长的邮件，您更喜欢直接打个电话解决问题。',
      blindSpot: '在极其嘈杂的环境中（如开放式办公室），您极易受到周围人谈话的干扰，导致阅读或写作效率直线下降。'
    },
    tips: [
      '遇到难懂的概念，尝试把它编成顺口溜、押韵的句子，或者用特定的旋律唱出来。',
      '当必须阅读枯燥的文字材料时，使用文字转语音（TTS）软件读给您听。',
      '购买一副高质量的降噪耳机，在需要深度工作时播放无歌词的白噪音或阿尔法脑波音乐。'
    ]
  },
  {
    type: 'reading', nameZh: '阅读写作', name: '读写型学习者', nameEn: 'Reading/Writing Learner', icon: '📖', color: '#10b981',
    description: '您是“文字逻辑”的拥趸。对您而言，文字具有无可比拟的精确性。做笔记、列清单、写长文，是您将外界信息内化为自我知识的最强武器。',
    curveDesc: '读写型学习者具备极强的深度阅读能力，专注力曲线非常平稳持久，在进行文字总结时会迎来二次高峰。',
    retentionData: [70, 80, 85, 90, 90, 85, 95],
    timeline: [
      { time: '0-20 Min', title: '深度阅读', desc: '进行无干扰的文本阅读，边读边在页边空白处写下批注和疑问。' },
      { time: '20-40 Min', title: '重构笔记', desc: '合上书本，不是抄写，而是用自己的语言逻辑重新写一份知识大纲或清单。' },
      { time: '40-50 Min', title: '文字输出', desc: '针对核心难点，写一段几百字的迷你博客或学习心得。' },
      { time: '50-60 Min', title: '校对提炼', desc: '将长笔记提炼为几个核心的关键词或记忆卡片（Flashcards）。' }
    ],
    analysis: {
      core: '您喜欢白纸黑字带来的确定感。字典、百科全书、维基百科是您最爱的资源。您的笔记往往密密麻麻且逻辑严密，写作是您理清思路的最佳方式。',
      academic: '您非常适应传统的教育体系。做历年真题、整理错题本、撰写论文对您来说得心应手。您是那种通过“疯狂抄写”就能记住单词的人。',
      work: '您是出色的文档撰写者、法律顾问、研究员或内容创作者。在开会前，如果您没有看到书面的会议议程，会感到非常缺乏安全感。',
      blindSpot: '可能会陷入“过度做笔记”的陷阱，把精力全花在抄写上而忽略了真正的理解；对缺乏文字说明的纯实操类任务感到无从下手。'
    },
    tips: [
      '使用康奈尔笔记法（Cornell Notes），强迫自己不仅要记录，还要提炼线索和写总结。',
      '遇到只有视频的教程，一定要打开字幕，或者使用AI工具将语音转成文字稿后再阅读。',
      '建立您的个人维基百科（如使用 Notion 或 Obsidian），享受文字互联带来的知识复利。'
    ]
  },
  {
    type: 'kinesthetic', nameZh: '动觉学习', name: '动觉型学习者', nameEn: 'Kinesthetic Learner', icon: '🤲', color: '#f59e0b',
    description: '您是“身体记忆”的践行者。坐在桌前死读书对您简直是酷刑。您必须通过触摸、移动、实践和试错，才能真正把知识刻进肌肉记忆里。',
    curveDesc: '动觉型学习者的专注力极其陡峭，通常只能维持短暂的20分钟，随后断崖式下跌，必须通过肢体活动来重启专注力。',
    retentionData: [95, 80, 40, 90, 70, 40, 95], // 剧烈波动，需要休息
    timeline: [
      { time: '0-20 Min', title: '高强度实操', desc: '直接上手操作。如果是编程就直接敲代码，如果是背单词就边走边背。' },
      { time: '20-25 Min', title: '肢体重启', desc: '专注力断崖下跌，必须站起来走动、拉伸，或者去倒杯水，让大脑重新充血。' },
      { time: '25-45 Min', title: '角色扮演', desc: '模拟真实的考试场景或工作场景，用身体动作配合记忆。' },
      { time: '45-60 Min', title: '实物连接', desc: '把学到的抽象概念与身边具体的实物联系起来，或者通过制作实物模型来巩固。' }
    ],
    analysis: {
      core: '您的身体和大脑是紧密相连的。您在思考时喜欢手里转笔、踱步或敲击桌面。真正的“理解”对您而言，意味着“我亲自做过一遍并且成功了”。',
      academic: '传统的讲授式课堂让您感到非常痛苦和无聊。您在实验室、体育课或社会实践中表现最为突出。理论知识对您来说必须要有现实应用场景。',
      work: '您是天生的实干家。外科医生、工程师、现场导演、销售等需要不断移动和动手的职业是您的最爱。比起看说明书，您更喜欢直接把机器拆了再装回去。',
      blindSpot: '极其缺乏耐心去阅读长篇大论的手册或听取冗长的理论讲解；容易因为没有耐心打好理论基础而导致在实践中反复犯低级错误。'
    },
    tips: [
      '坚决采用番茄工作法（25分钟工作+5分钟休息），不要强迫自己长时间静坐。',
      '将学习任务游戏化、实体化。比如用乐高积木来理解分子结构，用走位来背诵历史事件。',
      '如果必须阅读，可以尝试站立办公桌（Standing Desk）或者一边在跑步机上慢走一边看书。'
    ]
  }
]

// 获取排序后的维度和主导风格
const sortedDimensions = computed(() => {
  return [...allStyles].map(style => ({
    ...style,
    score: dimensionScores.value.scores[style.nameZh] || 0
  })).sort((a, b) => b.score - a.score)
})

const primaryStyleType = computed(() => sortedDimensions.value[0].type)
const primaryStyle = computed(() => sortedDimensions.value[0])
const primaryStyleScore = computed(() => primaryStyle.value.score)

const getStyleScore = (type) => sortedDimensions.value.find(d => d.type === type)?.score || 0

// ======= 统计图：雷达图数据 =======
const radarChartData = computed(() => {
  return {
    labels: allStyles.map(s => s.nameZh),
    datasets: [{
      label: '学习通道带宽',
      backgroundColor: 'rgba(99, 102, 241, 0.2)',
      borderColor: 'rgba(99, 102, 241, 1)',
      pointBackgroundColor: 'rgba(99, 102, 241, 1)',
      pointBorderColor: '#fff',
      data: allStyles.map(s => getPercentage(getStyleScore(s.type), maxScoreObj.value[s.nameZh] || 60))
    }]
  }
})

const radarChartOptions = {
  responsive: true, maintainAspectRatio: false,
  scales: { r: { suggestedMin: 0, suggestedMax: 100, ticks: { display: false } } },
  plugins: { legend: { display: false } }
}

// ======= 折线图：专注力留存数据 =======
const lineChartData = computed(() => {
  return {
    labels: ['0分', '10分', '20分', '30分', '40分', '50分', '60分'],
    datasets: [{
      label: '专注力水平 (%)',
      borderColor: primaryStyle.value.color,
      backgroundColor: primaryStyle.value.color + '33', // 添加透明度作为阴影
      borderWidth: 3,
      fill: true,
      tension: 0.4, // 让曲线平滑
      pointRadius: 4,
      pointBackgroundColor: '#fff',
      pointBorderColor: primaryStyle.value.color,
      data: primaryStyle.value.retentionData
    }]
  }
})

const lineChartOptions = {
  responsive: true, maintainAspectRatio: false,
  scales: {
    y: { suggestedMin: 0, suggestedMax: 100, title: { display: true, text: '专注力 (%)' } },
    x: { grid: { display: false } }
  },
  plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } }
}

// ======= 推荐工具 =======
const recommendedTools = computed(() => {
  const tools = {
    visual: [
      { name: 'XMind / Miro', icon: '🧠', description: '构建庞大的网状思维导图与视觉白板。' },
      { name: 'GoodNotes', icon: '✍️', description: '在平板上进行多色彩的自由手写与高亮标注。' }
    ],
    auditory: [
      { name: 'Otter.ai / 飞书妙记', icon: '🎤', description: '课堂或会议实时录音并提取重点，方便反复回听。' },
      { name: '喜马拉雅 / 播客', icon: '🎧', description: '将通勤或运动时间转化为听觉学习的黄金期。' }
    ],
    reading: [
      { name: 'Obsidian / Notion', icon: '🔗', description: '强大的双向链接笔记，构建您的第二大脑。' },
      { name: 'Anki', icon: '🃏', description: '基于文字的间隔重复记忆神器。' }
    ],
    kinesthetic: [
      { name: '番茄钟 (Pomodoro)', icon: '🍅', description: '强制将时间切块，保障动觉型必须的物理休息。' },
      { name: 'Quizlet', icon: '🎮', description: '将枯燥背诵转化为翻卡片、配对等互动手指游戏。' }
    ]
  }
  return tools[primaryStyleType.value]
})

</script>

<style scoped>
/* 继承高度专业的设计语言 */
.learning-style-results {
  color: #334155;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  max-width: 950px;
  margin: 0 auto;
  padding: 1rem;
}

.card-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 2.5rem;
  margin-bottom: 2.5rem;
  box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: #1e293b;
  margin-top: 0;
  margin-bottom: 0.8rem;
}

.section-intro {
  color: #64748b;
  font-size: 1.05rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}

/* 顶部总览区 */
.header-section { text-align: center; margin-bottom: 3rem; }
.title { font-size: 2.2rem; font-weight: 800; color: #6366f1; margin-bottom: 1rem; }
.subtitle { color: #64748b; font-size: 1.05rem; line-height: 1.8; max-width: 800px; margin: 0 auto; }

.top-overview {
  display: flex;
  align-items: center;
  gap: 4rem;
  background: linear-gradient(to right bottom, #ffffff, #f8fafc);
}

.primary-style-highlight {
  flex: 1;
  text-align: center;
}
.style-icon-large { font-size: 5rem; line-height: 1; margin-bottom: 1rem; filter: drop-shadow(0 8px 16px rgba(0,0,0,0.1)); }
.highlight-title { color: #94a3b8; font-size: 1rem; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 0.5rem; }
.style-name { font-size: 2.5rem; font-weight: 900; margin: 0 0 1rem 0; }
.style-description { color: #475569; line-height: 1.6; font-size: 1.1rem; margin-bottom: 1.5rem; text-align: justify; }
.score-badge { display: inline-block; padding: 0.6rem 1.5rem; color: white; border-radius: 30px; font-weight: 800; font-size: 1.1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }

.radar-chart-container { flex: 1; height: 350px; width: 100%; max-width: 400px; }
.chart-title { text-align: center; color: #334155; margin-bottom: 1rem; font-size: 1.1rem; }

/* 效率流（折线图与时序图） */
.efficiency-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
}
.line-chart-container { height: 250px; margin-bottom: 1rem; }
.chart-tip { font-size: 0.9rem; color: #64748b; line-height: 1.5; font-style: italic; background: #f8fafc; padding: 1rem; border-radius: 8px; }

/* 炫酷的时序图 CSS */
.custom-timeline {
  position: relative;
  padding-left: 20px;
}
.custom-timeline::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 10px;
  bottom: 10px;
  width: 2px;
  background: #e2e8f0;
}
.timeline-item {
  position: relative;
  margin-bottom: 1.5rem;
}
.timeline-item:last-child { margin-bottom: 0; }
.timeline-marker {
  position: absolute;
  left: -20px;
  top: 5px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 3px solid #fff;
  box-shadow: 0 0 0 1px #cbd5e1;
}
.time-label { font-size: 0.85rem; font-weight: 800; margin-bottom: 0.2rem; }
.step-title { margin: 0 0 0.4rem 0; font-size: 1.1rem; color: #1e293b; }
.step-desc { margin: 0; font-size: 0.95rem; color: #475569; line-height: 1.5; }

/* 各维度解析 */
.grid { display: flex; flex-direction: column; gap: 2rem; }
.dimension-card {
  padding: 2rem; margin-bottom: 0;
  transition: all 0.3s ease;
}
.dimension-card.is-primary { border: 2px solid #6366f1; box-shadow: 0 8px 25px -5px rgba(99, 102, 241, 0.15); }

.dim-header { display: flex; align-items: center; gap: 1.2rem; margin-bottom: 1.5rem; }
.dim-icon { font-size: 2.5rem; }
.dim-title { flex: 1; }
.dim-title h4 { margin: 0; font-size: 1.3rem; color: #1e293b; font-weight: 800; }
.dim-en { font-size: 0.85rem; color: #94a3b8; text-transform: uppercase; font-weight: 600; }
.dim-score { text-align: right; }
.score-val { font-size: 2rem; font-weight: 900; }
.score-max { color: #94a3b8; font-size: 1rem; }

.bar-container { margin-bottom: 2rem; }
.bar-bg { height: 12px; background: #e2e8f0; border-radius: 999px; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 999px; transition: width 1s ease; }

.interpretation .detail-block { margin-bottom: 1.25rem; }
.interpretation .detail-block strong { display: block; font-size: 1.05rem; color: #1e293b; margin-bottom: 0.4rem; }
.interpretation .detail-block p { margin: 0; color: #475569; line-height: 1.7; font-size: 0.98rem; text-align: justify; }
.interpretation .detail-block.warning p { color: #b45309; background: #fffbeb; padding: 0.8rem 1rem; border-radius: 8px; border-left: 3px solid #f59e0b; }

.advice-box { background: #f8fafc; padding: 1.5rem; border-radius: 12px; border-left: 4px solid #ccc; margin-top: 1.5rem; }
.advice-box h4 { margin: 0 0 1rem 0; font-size: 1.1rem; }
.tips { margin: 0; padding-left: 1.2rem; color: #475569; font-size: 0.98rem; line-height: 1.6; }
.tips li { margin-bottom: 0.5rem; }

/* 工具区 */
.tools-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.tool-card { border: 1px solid #e2e8f0; padding: 1.5rem; border-radius: 12px; display: flex; flex-direction: column; align-items: center; text-align: center; background: #f8fafc; }
.tool-icon { font-size: 2.5rem; margin-bottom: 1rem; }
.tool-card h4 { margin: 0 0 0.5rem 0; color: #1e293b; font-size: 1.1rem; font-weight: 800; }
.tool-card p { margin: 0; color: #64748b; font-size: 0.95rem; line-height: 1.5; }

/* 响应式 */
@media (max-width: 768px) {
  .top-overview { flex-direction: column; gap: 2rem; padding: 1.5rem; }
  .radar-chart-container { height: 300px; }
  .efficiency-grid { grid-template-columns: 1fr; gap: 2rem; }
  .tools-grid { grid-template-columns: 1fr; }
  .card-box { padding: 1.5rem; }
}

/* 打印样式 */
.print-header, .print-footer { display: none; }

@media print {
  @page { size: A4; margin: 15mm; }
  body, .learning-style-results { background: white !important; color: #000 !important; }
  .print-header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 30px; font-weight: bold; }
  .print-footer { display: block; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center; font-size: 12px; color: #666; }
  .card-box { border: none; box-shadow: none; padding: 0; margin-bottom: 40px; }
  .dimension-card { page-break-inside: avoid; border: none !important; }
  .efficiency-grid { display: block; }
  .line-chart-wrapper, .timeline-wrapper { page-break-inside: avoid; margin-bottom: 30px; }
  .bar-bg { background: #e2e8f0; border: 1px solid #cbd5e1; }
  .bar-fill { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .timeline-marker, .score-badge { -webkit-print-color-adjust: exact; print-color-adjust: exact; color: #000; }
  .detail-block.warning p { background: none; border: 1px solid #fcd34d; border-left: 3px solid #f59e0b; color: #000; }
}
</style>