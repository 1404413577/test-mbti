<template>
  <div class="bf-results-container">
    <div class="print-header">
      <div class="print-logo">OCEAN 深度性格测评报告</div>
      <div>生成日期: {{ currentDate }}</div>
    </div>

    <div class="header-section">
      <h2 class="title">大五人格 (Big Five) 深度评估报告</h2>
      <p class="subtitle">
        本报告基于广受全球学术界与世界500强企业认可的 OCEAN 模型，从五个核心维度全方位剖析您的性格底色，为您提供长达数千字的深度解读，助力您的职业规划与自我认知。
      </p>
    </div>

    <div class="report-content">
      <div class="visualization-section card-box">
        <h3 class="section-title">性格特征全景图</h3>
        <div class="radar-chart-container">
          <Radar :data="chartData" :options="chartOptions" v-if="chartData.datasets.length > 0" />
        </div>
        <p class="chart-caption">
          注：图形的形状和偏向代表了您的独特性格基因。面积越大代表在该维度的特质越显著。
        </p>
      </div>

      <div class="dimensions-section">
        <h3 class="section-title">五大维度深度解析</h3>
        <div class="grid">
          <div v-for="d in dimensions" :key="d.key" class="dimension-card card-box">
            
            <div class="card-head">
              <div class="icon-wrap">
                <span class="icon">{{ d.icon }}</span>
              </div>
              <div class="head-info">
                <div class="name-en">{{ d.nameEn }}</div>
                <div class="name-zh">{{ d.nameZh }}</div>
              </div>
              <div class="score-display">
                <span class="score-number">{{ d.score }}</span>
                <span class="score-max">/ {{ d.max }}</span>
              </div>
            </div>
            
            <div class="bar-container">
              <div class="bar-bg">
                <div class="bar-fill" :style="{ width: getPercentage(d.score, d.max) + '%', backgroundColor: d.color }"></div>
              </div>
              <div class="bar-labels">
                <span>低倾向</span>
                <span>均衡型</span>
                <span>高倾向</span>
              </div>
            </div>

            <div class="interpretation">
              <h4 class="trait-level" :style="{ color: d.color }">
                📊 评估结果: {{ getLevelInfo(d.key, d.score, d.max).label }}
              </h4>
              
              <div class="detail-block">
                <strong>📌 核心特质：</strong>
                <p>{{ getLevelInfo(d.key, d.score, d.max).desc }}</p>
              </div>

              <div class="detail-block">
                <strong>💼 职场与事业：</strong>
                <p>{{ getLevelInfo(d.key, d.score, d.max).work }}</p>
              </div>

              <div class="detail-block">
                <strong>🤝 社交与情感：</strong>
                <p>{{ getLevelInfo(d.key, d.score, d.max).relationship }}</p>
              </div>

              <div class="detail-block warning">
                <strong>⚠️ 潜在盲区：</strong>
                <p>{{ getLevelInfo(d.key, d.score, d.max).blindSpot }}</p>
              </div>
            </div>

            <div class="advice-box">
              <h4>💡 专属提升建议</h4>
              <ul class="tips">
                <li v-for="(tip, index) in getLevelInfo(d.key, d.score, d.max).tips" :key="index">
                  {{ tip }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div class="conclusion-section card-box">
        <h3 class="section-title">报告结语</h3>
        <p>
          性格测评不是为了给您贴上固定的标签，而是为您提供一面客观审视自我的镜子。您的 OCEAN 大五人格模型展示了您独一无二的潜力分布。请记住，每一种特质在特定的情境下都能转化为巨大的优势。希望这份深度报告能成为您实现个人成长、优化职业道路和改善人际关系的有力工具。
        </p>
      </div>
    </div>
    
    <div class="print-footer">
      <p>本测评基于国际权威心理学量表编制，报告内容由系统自动生成，拥有专属版权。</p>
      <p>请妥善保管您的测评结果，禁止未经授权的二次传播。</p>
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

const rawScores = computed(() => {
  const scores = { O: 0, C: 0, E: 0, A: 0, N: 0 }
  const max = { O: 0, C: 0, E: 0, A: 0, N: 0 }

  props.answers.forEach((ans, i) => {
    if (ans && ans.scoring) {
      Object.keys(scores).forEach(k => { if (ans.scoring[k]) scores[k] += ans.scoring[k] })
    }
    const q = props.questions[i]
    if (q && q.options) {
      q.options.forEach(opt => {
        if (opt.scoring) {
          Object.keys(max).forEach(k => { max[k] = Math.max(max[k], opt.scoring[k] || 0) })
        }
      })
    }
  })

  Object.keys(max).forEach(k => { if (max[k] === 0) max[k] = Math.max(props.questions.length, 10) })
  return { scores, max }
})

const dimensionMeta = {
  O: { key: 'O', nameZh: '开放性 (Openness)', nameEn: '对经验的开放程度、想象力与创造力', icon: '💡', color: '#8b5cf6' },
  C: { key: 'C', nameZh: '尽责性 (Conscientiousness)', nameEn: '自律能力、责任感与成就动机', icon: '🎯', color: '#10b981' },
  E: { key: 'E', nameZh: '外向性 (Extraversion)', nameEn: '社交能量、活跃度与自信心', icon: '🔥', color: '#f59e0b' },
  A: { key: 'A', nameZh: '宜人性 (Agreeableness)', nameEn: '同理心、合作意愿与信任度', icon: '🤝', color: '#3b82f6' },
  N: { key: 'N', nameZh: '情绪稳定性 (Neuroticism)', nameEn: '压力管理、情绪调节与抗挫折力', icon: '🧘', color: '#14b8a6' }
}

const dimensions = computed(() => {
  return Object.keys(dimensionMeta).map(k => ({
    ...dimensionMeta[k],
    score: rawScores.value.scores[k] || 0,
    max: rawScores.value.max[k] || 1
  }))
})

const getPercentage = (score, max) => Math.min(Math.max(Math.round((score / max) * 100), 0), 100)

const chartData = computed(() => {
  if (dimensions.value.length === 0) return { labels: [], datasets: [] }
  return {
    labels: dimensions.value.map(d => d.nameZh.split(' ')[0]),
    datasets: [{
      label: '性格特质',
      backgroundColor: 'rgba(99, 102, 241, 0.2)',
      borderColor: 'rgba(99, 102, 241, 1)',
      pointBackgroundColor: 'rgba(99, 102, 241, 1)',
      pointBorderColor: '#fff',
      data: dimensions.value.map(d => getPercentage(d.score, d.max))
    }]
  }
})

const chartOptions = {
  responsive: true, maintainAspectRatio: false,
  scales: { r: { suggestedMin: 0, suggestedMax: 100, ticks: { display: false } } },
  plugins: { legend: { display: false } }
}

// 超海量文案库：涵盖四大维度（核心、职场、社交、盲区）
const interpretationDict = {
  O: {
    high: {
      label: '极具创造力的探索者',
      desc: '您拥有极其丰富的内心世界和极高的审美感知力。您不喜欢墨守成规，对未知事物抱有强烈的好奇心，思维的发散性和跳跃性让您总能看到别人忽略的可能性。',
      work: '在职场中，您是天生的创新者。您非常适合从事研发、设计、艺术创作、战略规划等需要“从0到1”破局的工作。您能够迅速适应行业变革，并在头脑风暴中贡献最具价值的金点子。',
      relationship: '在人际交往中，您容易被有趣、有思想深度的人吸引。您能包容多样性的价值观，在亲密关系中追求精神层面的共鸣和新鲜感，排斥枯燥乏味的日常。',
      blindSpot: '由于思维过于活跃，您可能在执行落地阶段显得缺乏耐心；对新事物的追逐可能会导致您在日常枯燥的重复性任务中感到极度内耗。',
      tips: ['寻找能为您提供后勤和执行支持的搭档，形成“您负责想象，TA负责落地”的完美组合。', '刻意练习“闭环思维”，在一个绝妙的创意诞生后，强迫自己规划出前三步的具体执行计划。']
    },
    mid: {
      label: '务实与创新的平衡者',
      desc: '您在保守与激进之间找到了极佳的平衡。您既能欣赏前卫的艺术和理念，也能安心遵循成熟的传统和规则。您不会为了改变而改变，而是追求“有价值的创新”。',
      work: '您是企业中极好的“变革推动者”。您既理解管理层稳健的需求，又能接受前沿技术的应用。非常适合产品经理、项目经理等需要权衡各方利益的岗位。',
      relationship: '您的人际交往十分宽容。您可以和极度传统的人和平相处，也能和前卫的艺术家聊得来。在感情中，您能兼顾现实的稳定和偶尔的浪漫惊喜。',
      blindSpot: '在某些需要极端颠覆性创新的时刻，您可能会显得稍显保守；而在需要完全按部就班的流水线工作中，您又会觉得受到压抑。',
      tips: ['在面临重大决策时，可以尝试偶尔抛开所有现实顾虑，做一次极其大胆的假设。', '您的综合性是最大优势，不必强求自己在某一个极端领域做到极致，跨界整合才是您的舞台。']
    },
    low: {
      label: '脚踏实地的守护者',
      desc: '您是一位极具现实主义精神的人。您尊重传统，相信经验，更喜欢具体、切实、可见的事物，而非虚无缥缈的理论。您在熟悉的环境中能发挥出最大的效能。',
      work: '您是任何组织中不可或缺的“稳定器”。在财务、法务、质量控制、行政运营等需要极度严谨和遵守规则的岗位上，您能提供别人无法企及的可靠性。',
      relationship: '您对待感情非常忠诚且负责。您不追求虚幻的浪漫，而是用实际行动（如做好一顿饭、打理好家庭）来表达爱意，是极为可靠的伴侣和朋友。',
      blindSpot: '面对突如其来的行业变革或生活变故，您可能会产生较强的抗拒心理；有时可能会因为过于注重眼前的细节，而忽略了长远的发展趋势。',
      tips: ['定期阅读一些行业前沿的资讯，即使它们目前看起来不实用，也有助于减少您对未知的恐惧。', '在他人提出新想法时，试着先说“我们来看看怎么实现它”，而不是立刻指出其不现实的地方。']
    }
  },
  C: {
    high: {
      label: '高度自律的成就者',
      desc: '您拥有极强的责任感和内驱力。在生活中，您井井有条，信守承诺；在面对困难时，您展现出远超常人的毅力和专注度，是典型的“目标导向型”人格。',
      work: '您是领导和同事眼中最靠谱的搭档。只要任务交到您手上，就意味着“必有回音”。您适合绝大多数需要高度责任心和执行力的岗位，特别是中高级管理层、独立顾问等。',
      relationship: '在社交和情感中，您非常看重承诺。您对伴侣的要求同样很高，希望双方能共同进步。您的生活通常规划得很好，能给家人带来极大的安全感。',
      blindSpot: '您容易陷入“工作狂”的模式，给自己施加过大的压力；有时可能因为对标准要求过高，而显得缺乏人情味，让周围的人感到紧张。',
      tips: ['将“休息和放松”也列入您的待办事项清单中，并像对待工作一样严格执行它。', '学会接受“足够好”即可（Done is better than perfect），并非所有事情都需要做到100分。']
    },
    mid: {
      label: '张弛有度的生活家',
      desc: '您在自律与随性之间切换自如。您深知责任的重要性，在关键时刻能够全力以赴；但您也拒绝被工作完全绑架，认为生活同样需要享受和放松。',
      work: '您能够高效完成份内的工作，但不会无意义地“内卷”。您适合节奏相对健康的企业环境，能够在保证产出质量的同时，维护团队的融洽氛围。',
      relationship: '您是一个令人感到舒适的伴侣或朋友。您既能承担起应有的责任，又不会用严苛的条条框框去要求对方，感情生活通常充满弹性。',
      blindSpot: '在缺乏外部监督的情况下，您可能会偶尔产生拖延心理；在长期的宏大目标面前，如果缺乏阶段性反馈，您的毅力可能会有所动摇。',
      tips: ['对于耗时较长的大型目标，建议将其拆分为更小的、有明确时间节点的里程碑任务。', '找到属于您自己的“心流时刻”，在最重要的几件事情上投入您最高级别的专注力。']
    },
    low: {
      label: '随心所欲的体验者',
      desc: '您崇尚自由，讨厌被规则和计划束缚。您更喜欢跟着感觉走，享受当下的快乐。灵活、适应力强是您的代名词，您能在混乱中找到独特的生存之道。',
      work: '刻板的朝九晚五和繁文缛节会让您窒息。您更适合弹性工作制、自由职业、或者是需要大量即兴发挥的工作环境，如现场活动策划、危机公关等。',
      relationship: '和您在一起总是充满乐趣和意外惊喜。您不按常理出牌的性格十分吸引人，但有时也会因为忘记承诺或缺乏规划，让伴侣缺乏安全感。',
      blindSpot: '长期缺乏规划可能导致您错失重要的发展机会；容易冲动行事，可能会在个人财务或职业生涯中留下一些难以收拾的烂摊子。',
      tips: ['尝试引入极简的“习惯追踪系统”，不需要复杂，哪怕只是每天固定时间阅读10分钟，培养微小的自律。', '借助外部工具（如日历提醒、任务清单APP）来弥补记忆和规划上的不足。']
    }
  },
  E: {
    high: {
      label: '光芒四射的社交枢纽',
      desc: '您精力充沛，热情洋溢，外部世界是您补充能量的源泉。您喜欢成为人群中的焦点，乐于表达自我，强烈的自信让您在任何场合都能迅速破冰。',
      work: '职场上的您极具号召力。您是天生的销售专家、公关达人或团队领袖。您擅长整合人脉资源，在需要高强度沟通、谈判和演讲的岗位上如鱼得水。',
      relationship: '您通常朋友众多，社交圈广阔。在亲密关系中，您往往是主动的一方，喜欢组织活动和制造惊喜，您的伴侣会被您的活力深深感染。',
      blindSpot: '过分关注外部世界可能导致您缺乏深刻的自我反思时间；有时因为表达欲望过强，可能会不自觉地忽略他人的感受和发言权。',
      tips: ['刻意练习“倾听”的艺术。在他人说话时，尝试不要立刻思考如何回应，而是完全理解对方的意思。', '每月为自己安排半天的“断网独处时间”，用于沉淀思想和恢复内心平静。']
    },
    mid: {
      label: '收放自如的沟通者',
      desc: '您展现出了迷人的“中间性格（Ambivert）”。您可以像外向者一样在聚会上侃侃而谈，也能像内向者一样享受一个人的周末。您的社交能量开关完全由自己掌控。',
      work: '您能够完美适应绝大多数的职场环境。在需要团队协作时您从不缺席，在需要独立办公时您也能立刻专注。这种可塑性是您最大的职业资本。',
      relationship: '您不仅懂得如何活跃气氛，也懂得如何给予他人舒适的私人空间。这使您成为极佳的倾听者和陪伴者，能与各种性格的人建立深厚友谊。',
      blindSpot: '由于您显得什么都能适应，周围的人有时很难摸清您的真实边界在哪里，可能会无意中过度消耗您的精力。',
      tips: ['不要害怕拒绝。当您感到社交疲劳时，大方地表达您需要休息，真正的朋友会完全理解。', '利用您的中间人优势，在团队中多做“润滑剂”和“翻译官”，协调极度外向和极度内向成员的关系。']
    },
    low: {
      label: '深邃内敛的思考者',
      desc: '您喜欢安静、独立的环境。与人社交（尤其是大规模聚会）会迅速消耗您的能量。您话不多，但通常言之有物，内心世界极为丰富且深邃。',
      work: '您是深度工作（Deep Work）的高手。您非常适合程序员、研究员、作家、数据分析师等需要高度集中注意力和独立思考的岗位，能在安静中爆发出巨大的生产力。',
      relationship: '您的交友原则是“贵精不贵多”。您可能只有三两知己，但关系极其深厚和忠诚。在感情中，您慢热但长情，是值得托付一生的伴侣。',
      blindSpot: '在倡导外向的社会文化中，您的光芒容易被掩盖；遇到不公或有极好的想法时，可能因为不愿意出风头而错失属于自己的机会。',
      tips: ['准备一段精炼的“电梯演讲（Elevator Pitch）”，在关键的社交场合，确保自己能在30秒内清晰表达自己的核心价值。', '通过书面形式（如发邮件、写文档、写博客）来展示您的才华，这是属于内向者的最佳发声方式。']
    }
  },
  A: {
    high: {
      label: '极具同理心的支持者',
      desc: '您拥有一颗柔软且善良的心。您极度关注他人的需求，充满同理心，总是愿意相信人性的美好。维护和谐的人际关系是您潜意识的首要任务。',
      work: '您是最佳的团队合作者和客户服务者。在人力资源、教育、医疗护理、心理咨询等需要高度共情和利他精神的行业中，您能找到巨大的职业成就感。',
      relationship: '在任何关系中，您都倾向于付出和包容。您在冲突中往往选择退让以保持和平，您的温柔体贴让伴侣和家人感到无比的舒适和被爱。',
      blindSpot: '因为过于在意他人看法，您极易陷入“讨好型人格”；不懂得拒绝会让您承担过多的负担，且容易在竞争激烈的环境中被他人利用。',
      tips: ['建立坚固的“心理边界”。请牢记，牺牲自己换来的和平是脆弱的，您个人的感受和需求同样重要。', '练习在小事上说“不”。当别人提出不合理要求时，尝试用温和但坚定的语气拒绝。']
    },
    mid: {
      label: '外圆内方的协作者',
      desc: '您对人友善，但并不盲从。您懂得换位思考，愿意为团队利益做出妥协，但当触及到您的核心原则和底线时，您也会毫不犹豫地挺身捍卫。',
      work: '这是职场中最受欢迎的性格比例。您既具备良好的团队协作能力，又保留了批判性思维和谈判能力，非常适合商务拓展、部门协调、采购等岗位。',
      relationship: '您是通情达理的伴侣和朋友。您愿意在生活琐事上照顾对方的感受，但也要求对方在重大问题上给予您同等的尊重和对等的回报。',
      blindSpot: '在某些极度需要施展铁腕手段的时刻，您可能会显得有些心软；而在需要无私奉献的时刻，您又可能因为算计成本而显得有些功利。',
      tips: ['根据不同的人际关系（如竞争对手 vs 亲密战友）灵活调整您的宜人性阈值。', '继续保持您的“课题分离”能力，分清什么是别人的情绪，什么是自己的责任。']
    },
    low: {
      label: '冷峻客观的破局者',
      desc: '您非常理性、客观，甚至有时显得不近人情。您信奉“效率至上”和“实力说话”，不易被情感绑架。在处理问题时，您永远直奔结果，不惧怕任何对抗。',
      work: '您是绝佳的危机处理专家和业务开荒者。在法庭辩护、企业裁员重组、残酷的商业竞争等充满火药味的战场上，您不受情绪干扰的特质是致命的武器。',
      relationship: '您说话直截了当，讨厌拐弯抹角，这可能会让心思细腻的人感到受伤。您的伴侣必须同样内心强大，并能理解您“对事不对人”的沟通模式。',
      blindSpot: '过度直接可能会让您在组织中树敌过多，遭遇“暗箭”；缺乏同理心会导致您无法凝聚人心，难以成为能够激发下属潜能的卓越领导者。',
      tips: ['在提出严厉批评前，尝试使用“三明治反馈法”：先肯定优点，再指出问题，最后给出改进期望。', '有意识地培养您的“情绪智力（EQ）”，理解情绪也是影响商业和人际结果的关键变量。']
    }
  },
  N: { // 情绪稳定性 (反向解读)
    high: {
      label: '稳如泰山的定海神针',
      desc: '您拥有令人艳羡的强大神经系统。即使面对极大的压力、挫折或突发危机，您也能保持绝对的冷静和理智。负面情绪很难在您心里停留。',
      work: '在越是高压、高风险的职业（如外科医生、飞行员、金融操盘手、企业CEO）中，您的优势越发明显。您能在所有人都恐慌时做出最理性的决策。',
      relationship: '您给周围人带来极大的安全感。在伴侣情绪崩溃时，您总是最坚实的依靠。但有时您过于理性的反应，可能会让对方觉得您“冷血”或不在乎。',
      blindSpot: '由于自身很少体会到强烈的焦虑和痛苦，您可能很难共情那些深陷抑郁或焦虑中的人，容易低估别人正在遭受的心理创伤。',
      tips: ['当伴侣或朋友向您倾诉时，他们需要的往往不是解决方案，而是一个拥抱和一句“我理解你的感受”。', '定期审视自己，是否因为习惯了压抑情绪，而导致内心积压了未被察觉的压力。']
    },
    mid: {
      label: '韧性十足的普通人',
      desc: '您体验着正常人的喜怒哀乐。面临重大考试或业绩压力时您会失眠，遇到挫折也会流泪，但您具备良好的自我修复能力，假以时日总能重新站起来。',
      work: '您能够承受常规的职场压力。适当的焦虑感反而会转化为您提前准备的动力。您能理解同事的压力，是职场中富有同情心的战友。',
      relationship: '您真实且鲜活。您的伴侣能感受到您的情绪起伏，这让你们的互动充满生机。您能够与对方分享快乐，也能共同分担生活带来的焦虑。',
      blindSpot: '如果长期处于持续的高压环境中，未能及时进行情绪疏导，您的心理防线可能会被逐渐击穿，导致阶段性的职业倦怠。',
      tips: ['建立属于自己的“情绪缓冲系统”。无论是看电影、跑步还是冥想，确保每周都有固定时间彻底清空负能量。', '接纳自己偶尔的情绪失控，不要因为一时的焦虑而对自己产生自我怀疑。']
    },
    low: {
      label: '极度敏锐的感知者',
      desc: '您的神经触角极为丰富和敏感。您对周围环境的变化、他人的语气甚至未知的风险都有着雷达般的预警能力。这导致您容易感到焦虑、不安全和情绪起伏。',
      work: '由于对危险极度敏感，您非常适合风险评估、安全审查等工作；同时，您丰富的情感体验也让您在文学创作、艺术表演领域拥有得天独厚的天赋。',
      relationship: '您在感情中需要大量的确认和安全感保障。您的细腻让您能捕捉到伴侣最微小的情绪变化，但同时您也容易因为过度解读而产生无端的猜忌。',
      blindSpot: '高频的内耗会极大地消耗您的体力与精力，导致您在面对挑战时倾向于退缩；负面情绪的长期堆积可能影响您的生理健康。',
      tips: ['学会“课题分离”与“正念”。当焦虑来袭时，问自己：“这是目前我能控制的吗？”如果不能，请把注意力拉回到当下的呼吸上。', '不要过度美化“坚强”。当您感到撑不下去时，寻求专业心理咨询师的帮助，是勇敢而非软弱的表现。']
    }
  }
}

const getLevelInfo = (key, score, max) => {
  const pct = getPercentage(score, max)
  const dict = interpretationDict[key]
  if (!dict) return {}
  if (pct >= 66) return dict.high
  if (pct >= 33) return dict.mid
  return dict.low
}
</script>

<style scoped>
/* 继承之前的精美样式，针对大量文本进行排版优化 */
.bf-results-container {
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
  margin-bottom: 2rem;
  border-bottom: 2px solid #f1f5f9;
  padding-bottom: 1rem;
}

.print-header, .print-footer { display: none; }

.header-section { text-align: center; margin-bottom: 3rem; }
.title { font-size: 2.2rem; font-weight: 800; color: #6366f1; margin-bottom: 1rem; }
.subtitle { color: #64748b; font-size: 1.05rem; line-height: 1.8; max-width: 750px; margin: 0 auto; }

.visualization-section { display: flex; flex-direction: column; align-items: center; }
.radar-chart-container { width: 100%; max-width: 500px; height: 420px; position: relative; margin: 0 auto; }
.chart-caption { margin-top: 1.5rem; font-size: 0.9rem; color: #94a3b8; text-align: center; }

.grid { display: flex; flex-direction: column; gap: 2rem; }
.dimension-card { padding: 2rem; margin-bottom: 0; }

.card-head { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 1.5rem; }
.icon-wrap { width: 64px; height: 64px; background: #f8fafc; border-radius: 16px; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 2px 4px 0 rgba(0,0,0,0.03); }
.icon { font-size: 2rem; }
.head-info { flex: 1; }
.name-zh { font-size: 1.4rem; font-weight: 800; color: #1e293b; margin-bottom: 0.2rem; }
.name-en { font-size: 0.85rem; text-transform: uppercase; color: #94a3b8; font-weight: 600; }
.score-display { text-align: right; background: #f8fafc; padding: 0.8rem 1.2rem; border-radius: 12px; }
.score-number { font-size: 1.8rem; font-weight: 800; color: #334155; }
.score-max { font-size: 1rem; color: #94a3b8; font-weight: 600; }

.bar-container { margin-bottom: 2rem; }
.bar-bg { height: 14px; background: #f1f5f9; border-radius: 999px; overflow: hidden; box-shadow: inset 0 1px 2px rgba(0,0,0,0.05); }
.bar-fill { height: 100%; border-radius: 999px; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); }
.bar-labels { display: flex; justify-content: space-between; margin-top: 0.6rem; font-size: 0.85rem; color: #94a3b8; font-weight: 500; }

/* 排版长文本的关键样式 */
.interpretation { margin-bottom: 2rem; }
.trait-level { font-size: 1.2rem; font-weight: 800; margin-bottom: 1.5rem; margin-top: 0; padding-bottom: 0.5rem; border-bottom: 1px dashed #e2e8f0; }

.detail-block { margin-bottom: 1.25rem; }
.detail-block strong { display: block; font-size: 1.05rem; color: #1e293b; margin-bottom: 0.4rem; }
.detail-block p { margin: 0; color: #475569; line-height: 1.7; font-size: 0.98rem; text-align: justify; }

.detail-block.warning p { color: #b45309; background: #fffbeb; padding: 0.8rem 1rem; border-radius: 8px; border-left: 3px solid #f59e0b; }

.advice-box { background: #f8fafc; padding: 1.5rem; border-radius: 12px; border-left: 4px solid #6366f1; }
.advice-box h4 { margin-top: 0; margin-bottom: 1rem; color: #334155; font-size: 1.05rem; }
.tips { margin: 0; padding-left: 1.2rem; color: #475569; font-size: 0.98rem; line-height: 1.6; }
.tips li { margin-bottom: 0.8rem; }
.tips li:last-child { margin-bottom: 0; }

.conclusion-section p { color: #475569; line-height: 1.8; font-size: 1.05rem; text-align: justify; }

@media (max-width: 640px) {
  .card-head { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .score-display { align-self: flex-start; }
  .radar-chart-container { height: 320px; }
  .card-box { padding: 1.5rem 1rem; }
}

@media print {
  @page { size: A4; margin: 15mm; }
  body, .bf-results-container { background: white !important; color: #000 !important; }
  .print-header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 30px; font-weight: bold; }
  .print-footer { display: block; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center; font-size: 12px; color: #666; }
  .card-box { border: none; box-shadow: none; padding: 0; margin-bottom: 40px; }
  .dimension-card { page-break-inside: avoid; }
  .advice-box { background: none; border: 1px solid #e2e8f0; border-left: 4px solid #94a3b8; }
  .detail-block.warning p { background: none; border: 1px solid #fcd34d; border-left: 3px solid #f59e0b; color: #000; }
  .bar-bg { background: #e2e8f0; border: 1px solid #cbd5e1; }
  .bar-fill { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .radar-chart-container { height: 350px; }
}
</style>