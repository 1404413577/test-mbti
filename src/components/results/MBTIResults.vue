<template>
  <div class="mbti-results-container">
    <div class="print-header">
      <div class="print-logo">MBTI 深度性格解析报告</div>
      <div>生成日期: {{ currentDate }}</div>
    </div>

    <el-card class="hero-card" shadow="hover">
      <div class="hero-content">
        <h3 class="hero-subtitle">您的迈尔斯-布里格斯性格类型指数 (MBTI) 为：</h3>
        <h1 class="type-code">{{ personalityType }}</h1>
        <h2 class="type-name">{{ pInfo.name }} - {{ pInfo.title }}</h2>
        <el-divider border-style="dashed" />
        <p class="type-slogan">" {{ pInfo.slogan }} "</p>
      </div>
    </el-card>

    <el-card class="section-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="section-title">📊 您的认知维度图谱</span>
        </div>
      </template>
      
      <div class="dimensions-list">
        <div v-for="dim in dimensionScores" :key="dim.name" class="dimension-item">
          <el-row :gutter="20" align="middle">
            <el-col :xs="24" :sm="6">
              <div class="dim-info">
                <strong>{{ dim.name }}</strong>
                <span class="dim-desc">{{ dim.desc }}</span>
              </div>
            </el-col>
            <el-col :xs="24" :sm="18">
              <div class="bipolar-bar-container">
                <div class="label-left" :class="{ 'is-active': dim.preference === dim.leftKey }">
                  {{ dim.leftLabel }} ({{ dim.leftScore }})
                </div>
                
                <div class="bipolar-bar">
                  <div class="bar-left" :style="{ width: dim.leftPercentage + '%' }"></div>
                  <div class="bar-center-line"></div>
                  <div class="bar-right" :style="{ width: dim.rightPercentage + '%' }"></div>
                </div>
                
                <div class="label-right" :class="{ 'is-active': dim.preference === dim.rightKey }">
                  ({{ dim.rightScore }}) {{ dim.rightLabel }}
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
      <p class="chart-caption">注：进度条偏向代表您在处理信息、做决策时的主导偏好。得分越悬殊，代表该特质越明显；得分接近代表您能在两者间灵活切换。</p>
    </el-card>

    <div class="deep-analysis">
      <el-row :gutter="24">
        <el-col :xs="24" :lg="14">
          <el-card class="section-card" shadow="hover">
            <h3 class="block-title">📌 核心画像</h3>
            <p class="block-text">{{ pInfo.core }}</p>
            
            <h3 class="block-title mt-4">💼 职场与事业轨迹</h3>
            <p class="block-text">{{ pInfo.work }}</p>
            
            <h3 class="block-title mt-4">🤝 亲密关系与社交</h3>
            <p class="block-text">{{ pInfo.love }}</p>
          </el-card>
        </el-col>

        <el-col :xs="24" :lg="10">
          <el-card class="section-card" shadow="hover">
            <el-alert
              title="⚠️ 潜在盲区与内耗来源"
              type="warning"
              :description="pInfo.blindSpot"
              show-icon
              :closable="false"
              class="mb-4 custom-alert"
            />
            
            <h3 class="block-title mt-4">💡 个人进阶建议</h3>
            <ul class="tips-list">
              <li v-for="(tip, idx) in pInfo.tips" :key="idx">{{ tip }}</li>
            </ul>

            <el-divider />

            <h3 class="block-title">🎯 天赋职业匹配</h3>
            <div class="tags-container">
              <el-tag 
                v-for="(career, idx) in pInfo.careers" 
                :key="idx"
                effect="dark"
                round
                class="career-tag"
                color="#6366f1"
                style="border: none;"
              >
                {{ career }}
              </el-tag>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="print-footer">
      <p>本测评基于荣格的心理类型理论及 MBTI 框架编制，旨在促进自我认知与个人成长。</p>
      <p>温馨提示：性格类型没有优劣之分，且可能随着阅历与环境发生微调，请将此报告作为探索自我的向导，而非限制您的标签。</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  answers: Array,
  questions: Array,
  testType: String
})

const currentDate = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
})

// 计算各维度得分
const dimensionScores = computed(() => {
  const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 }
  
  props.answers.forEach((answer) => {
    if (answer && answer.scoring) {
      Object.keys(answer.scoring).forEach(dim => {
        if (scores[dim] !== undefined) scores[dim] += answer.scoring[dim]
      })
    }
  })
  
  const getPct = (a, b) => {
    const total = a + b
    return total === 0 ? 50 : Math.round((a / total) * 100)
  }

  return [
    {
      name: '能量来源 (E-I)', desc: '你从哪里获取动力？',
      leftKey: 'E', rightKey: 'I',
      leftLabel: '外倾 (E)', rightLabel: '内倾 (I)',
      leftScore: scores.E, rightScore: scores.I,
      leftPercentage: getPct(scores.E, scores.I),
      rightPercentage: getPct(scores.I, scores.E),
      preference: scores.E > scores.I ? 'E' : 'I'
    },
    {
      name: '信息收集 (S-N)', desc: '你如何看待世界？',
      leftKey: 'S', rightKey: 'N',
      leftLabel: '感觉 (S)', rightLabel: '直觉 (N)',
      leftScore: scores.S, rightScore: scores.N,
      leftPercentage: getPct(scores.S, scores.N),
      rightPercentage: getPct(scores.N, scores.S),
      preference: scores.S > scores.N ? 'S' : 'N'
    },
    {
      name: '判断决策 (T-F)', desc: '你如何做决定？',
      leftKey: 'T', rightKey: 'F',
      leftLabel: '思考 (T)', rightLabel: '情感 (F)',
      leftScore: scores.T, rightScore: scores.F,
      leftPercentage: getPct(scores.T, scores.F),
      rightPercentage: getPct(scores.F, scores.T),
      preference: scores.T > scores.F ? 'T' : 'F'
    },
    {
      name: '生活方式 (J-P)', desc: '你如何组织生活？',
      leftKey: 'J', rightKey: 'P',
      leftLabel: '判断 (J)', rightLabel: '知觉 (P)',
      leftScore: scores.J, rightScore: scores.P,
      leftPercentage: getPct(scores.J, scores.P),
      rightPercentage: getPct(scores.P, scores.J),
      preference: scores.J > scores.P ? 'J' : 'P'
    }
  ]
})

const personalityType = computed(() => dimensionScores.value.map(dim => dim.preference).join(''))

// 海量 16 型人格商业解析字典
const mbtiDict = {
  INTJ: {
    name: '建筑师', title: '战略与逻辑的执剑人', slogan: '一切都在我的计划之中。',
    core: '您拥有极其罕见且卓越的战略思维。作为独立且理性的思考者，您不盲从权威，只相信逻辑与系统。您看世界就像在看一个庞大的国际象棋棋盘，善于发现隐藏在复杂表象下的本质规律，并热衷于优化系统、解决极具挑战性的问题。',
    work: '在职场中，您是天生的规划师和架构师。您追求高效率和极致的专业度，讨厌繁文缛节和办公室政治。您非常适合担任独立贡献者或带领精英团队解决核心技术/商业难题。您的长远目光让您总能走在行业发展的前面。',
    love: '在亲密关系中，您并不擅长甜言蜜语，但您的爱意体现在为伴侣规划未来和解决实际问题上。您追求的是智力层面势均力敌的灵魂伴侣，渴望深度的精神共鸣，而非表面的浪漫。',
    blindSpot: '由于过度依赖逻辑，您可能会显得冷漠或不近人情，容易忽略他人的情感需求；对不完美事物的极低容忍度，也会让您常常陷入精神内耗和过度苛责。',
    tips: ['学会接纳“不完美”和“意外”，留出容错空间。', '刻意练习情感共鸣能力，沟通时先处理情绪，再处理问题。', '偶尔放下紧绷的计划，体验一次说走就走的旅行。'],
    careers: ['系统架构师', '战略规划顾问', '投资分析师', '科学家', '高级软件工程师']
  },
  INTP: {
    name: '逻辑学家', title: '追寻宇宙真理的思考者', slogan: '让我思考一下这个世界的底层代码。',
    core: '您是思想深邃、极具创新精神的探索者。相比于现实世界的人情世故，您对抽象理论、逻辑推理和客观真理有着更纯粹的狂热。您的大脑就像一台精密运行的超级计算机，时刻在捕捉漏洞、提出假设并建立庞大的思想体系。',
    work: '您是企业里不可或缺的“智囊”。在研发、数据分析或学术研究领域，您总能提出颠覆性的观点。您极度厌恶枯燥的重复性劳动和被微观管理，只有在给予您充分自由去探索未知时，您才能爆发出惊人的创造力。',
    love: '您在感情中真诚、直率但有些迟钝。您更希望伴侣是一个能与您彻夜探讨哲学或宇宙起源的人。您需要大量的私人空间来思考，如果伴侣过度粘人，您会感到窒息。',
    blindSpot: '强大的构思能力往往伴随着薄弱的执行力。您常常在脑海中已经完美解决了一个问题，就懒得在现实中去动手实现它；有时显得过于书呆子气，脱离实际。',
    tips: ['警惕“永远在构思，从未去执行”的陷阱，尝试建立最小可行性产品(MVP)。', '不要用解数学题的方法去解决人际关系问题。', '将脑海中的想法落实到纸面上，制定时间表强制输出。'],
    careers: ['算法工程师', '大学教授', '经济学家', '哲学家', '数据科学家']
  },
  ENTJ: {
    name: '指挥官', title: '果敢坚毅的破局者', slogan: '我来制定规则，你们负责执行。',
    core: '您是天生的统帅，浑身散发着自信与权威。您拥有强大的气场、极其清晰的目标感和无与伦比的执行力。在混乱的局面中，您总能迅速看清主次，制定战略，并雷厉风行地带领团队扫清一切障碍，取得最终胜利。',
    work: '职场就是您的游乐场。您极度渴望成就，喜欢挑战高难度的商业目标。无论是创业当CEO，还是在企业中担任高级管理层，您都能凭借铁腕手段和前瞻视野推动组织快速前进。您慕强，也只尊重实力对等的人。',
    love: '在感情中，您同样习惯于占据主导地位。您不仅希望自己成长，也极度渴望推动伴侣一起进步。您认为爱情也是需要经营的“项目”，会用极其高效和负责任的方式来维护家庭运转。',
    blindSpot: '为了达成目标，您有时会表现得冷酷无情、独断专行；您极度缺乏耐心去倾听他人的情绪宣泄，容易给下属或伴侣带来极大的压迫感，导致周围人只敢服从不敢谏言。',
    tips: ['领导力不仅是下达指令，还包括激发人心。请有意识地练习赞美他人。', '接受别人可能不如你高效的事实，培养容错率。', '不要把家庭当成另一个需要被征服的公司。'],
    careers: ['企业CEO', '高级管理顾问', '律师', '项目总监', '风险投资人']
  },
  ENTP: {
    name: '辩论家', title: '灵感迸发的智力挑战者', slogan: '规矩就是用来被打破的。',
    core: '您是聪明绝顶、极其敏锐的“破壁人”。您对任何既定规则都抱有怀疑态度，喜欢通过辩论来激发灵感。您思维跳跃、口才极佳，脑子里总有无数个新奇的点子在碰撞。没有什么是不能被讨论的，您是绝佳的头脑风暴发起者。',
    work: '您是绝佳的开荒者，适合从0到1的创新工作。在广告策划、产品创新、公关辩论等需要快速反应和极强创造力的领域，您如鱼得水。但您极度讨厌从1到100的繁琐维护工作，往往是挖了无数个坑，却懒得去填。',
    love: '您的魅力往往能迅速吸引伴侣，感情生活充满乐趣和刺激。但您容易喜新厌旧，对长久稳定的日常琐事缺乏耐心。要维系长期的关系，您的伴侣必须能持续给您带来智力上的新鲜感。',
    blindSpot: '为了辩论而辩论，常常在无意中激怒他人；想法太多但落地太少，容易给人留下“眼高手低”或“不靠谱”的印象。',
    tips: ['克制住在每个问题上都要反驳别人的冲动，有时只需倾听。', '找一个靠谱的执行者搭档，或者强迫自己把一个项目跟到底。', '不要把聪明才智浪费在无意义的争吵上。'],
    careers: ['连环创业者', '公关专家', '创意总监', '制片人', '营销策划']
  },
  INFJ: {
    name: '提倡者', title: '深邃纯粹的灵魂导师', slogan: '我能看见你心中隐藏的宇宙。',
    core: '作为十二型人格中最稀有的类型，您拥有深不可测的直觉和极强的同理心。您看似安静内敛，内心却燃烧着为人类谋福祉的理想主义之火。您能轻易看透他人的伪装，直击灵魂深处。您是坚定的信仰者，一旦认准目标，便会执着追求。',
    work: '您不仅仅是为了赚钱而工作，您渴望工作能带来深刻的社会意义。您非常适合心理咨询、教育、艺术创作或非营利组织。在职场中，您是那种能在默默无闻中带来深远影响的“精神领袖”。',
    love: '您对灵魂伴侣的渴望极度强烈。您很难轻易对人敞开心扉，一旦认定，便会毫无保留地付出深情。您追求极高浓度的精神契合，容不得半点虚假，因此有时会在感情中显得过于理想化和挑剔。',
    blindSpot: '过高的道德标准和理想主义让您极易陷入对现实的失望；由于吸收了太多他人的负面情绪，又极度需要独处，如果找不到排解出口，容易遭遇严重的精神内耗和职业倦怠（Burnout）。',
    tips: ['学会课题分离，不要把拯救世界的重担全部压在自己肩上。', '允许现实和伴侣存在瑕疵，降低极端的完美主义倾向。', '建立起坚固的情绪边界，学会拒绝他人的过度索取。'],
    careers: ['心理咨询师', '作家', '人力资源总监', '公益组织发起人', '教育家']
  },
  INFP: {
    name: '调停者', title: '追寻意义的治愈系诗人', slogan: '在这个残酷世界里，我依然选择温柔。',
    core: '您的内心是一座美丽且丰富的秘密花园。您极其敏感、善良，拥有极高的审美情趣和丰富的想象力。您受内在核心价值观驱动，渴望世间充满和平与真善美。在浮躁的社会中，您始终保持着一份难能可贵的纯真与诗意。',
    work: '刻板的商业社会和高压的竞争环境会让您枯萎。您适合在充满创意、允许个性表达的领域工作，如文学、设计、插画、心理辅导。您不是被金钱驱动的，而是被“这份工作是否符合我的价值观”所驱动。',
    love: '您是无可救药的浪漫主义者。在爱情中，您温柔体贴，极力避免冲突，愿意为对方付出一切。但您常常在脑海中将伴侣完美化，一旦对方在现实中打破了这个滤镜，您就会感到深受伤害。',
    blindSpot: '过于感性和脆弱，容易在挫折面前退缩；极度缺乏时间观念和执行力，常常沉浸在幻想中而忽略了现实生活的基础建设（如理财、职业规划）。',
    tips: ['你的温柔需要长出锋利的牙齿，学会坚定地保护自己的权益。', '为你的梦想制定一个带有具体日期的时间表。', '不要总是用逃避来面对现实中的冲突。'],
    careers: ['小说家', '插画师', '心理健康顾问', '编辑', '音乐家']
  },
  ENFJ: {
    name: '主人公', title: '光芒四射的精神领袖', slogan: '相信我，我们能一起创造奇迹。',
    core: '您浑身散发着温暖的魅力与号召力，是天生的领导者和教育家。您对他人抱有极大的热情，总是能敏锐地察觉到团队成员的情绪需求。您最大的快乐来自于激发他人的潜能，带领大家为了一个崇高的共同目标而奋斗。',
    work: '您是绝佳的团队领导者、培训师或政客。您擅长凝聚人心，能在团队士气低落时发表振奋人心的演讲。在职场中，只要有您在，团队的氛围总是积极向上、充满人情味的。您总是毫不吝啬地提携后辈。',
    love: '在感情中，您是那个主动照顾、不断付出的人。您不仅关注伴侣的生活，更关心他们的精神成长。但有时您过于热心的“安排”，可能会让喜欢自由的伴侣感到被过度干涉。',
    blindSpot: '极度害怕被讨厌，容易为了维持表面和谐而过度妥协；常常因为过度卷入他人的问题，而忽略了自身的疲惫和真实需求。',
    tips: ['你无法拯救所有人，学会把有限的精力留给自己。', '即使面临被讨厌的风险，也要勇敢地表达自己真实的反面意见。', '不要把自己的价值观强加给别人。'],
    careers: ['企业高管', '高级培训师', '公关总监', '政界人士', '猎头顾问']
  },
  ENFP: {
    name: '竞选者', title: '自由奔放的灵魂捕手', slogan: '生活就是一场盛大的冒险！',
    core: '您是人群中闪耀的小太阳，充满活力、热情洋溢且极具感染力。您对世界充满了无限的好奇，认为一切皆有可能。比起按部就班的稳定，您更追求自由、新奇的体验和深刻的情感连接。您是真正的“人际关系破冰机”。',
    work: '您无法忍受枯燥乏味、一眼望到头的格子间工作。在创意营销、活动策划、媒体传播或跨文化交流的岗位上，您的创造力和交际能力将大放异彩。您总能想出让人拍案叫绝的创意点子。',
    love: '您的爱情通常轰轰烈烈、充满浪漫与惊喜。您很容易陷入热恋，也极需伴侣能和您一起疯、一起探索世界。但如果关系进入平淡的柴米油盐期，您可能会感到厌倦并渴望逃离。',
    blindSpot: '三分钟热度，极度缺乏耐心和持久力；容易被新鲜事物分散注意力，导致项目常常有头无尾；在面临必须处理的繁琐细节或数据时，容易产生极大的抗拒。',
    tips: ['培养“完成比完美更重要”的习惯，强迫自己收尾每一个项目。', '为自己的冲动消费和随性设定一些基础的财务/时间规则。', '学会欣赏平淡生活中的微小幸福。'],
    careers: ['市场总监', '独立记者', '活动策划师', '品牌顾问', '旅游体验师']
  },
  ISTJ: {
    name: '物流师', title: '秩序与传统的捍卫者', slogan: '说到做到，这就是我的规矩。',
    core: '您是整个社会机器中最可靠的基石。您务实、严谨、极其负责任。您不相信虚无缥缈的理论，只看重事实、数据和过往的成功经验。一旦您承诺了一件事，无论遇到多大的困难，您都会一丝不苟地将它完成。',
    work: '在财务、审计、法务、工程管理等需要极高精确度和责任心的领域，您是无可挑剔的专家。您遵守制度，注重效率，对工作中的任何错漏都有着零容忍的态度。您是老板最放心的“大管家”。',
    love: '您不是那种会制造浪漫惊喜的人，但您对伴侣和家庭极其忠诚。您会按时交工资、准时修好家里的坏水管、记住所有的重要纪念日。您的爱是深沉、安静且充满踏实的安全感的。',
    blindSpot: '过度墨守成规，对突如其来的变化缺乏适应力；在沟通中过于生硬直白，常常因为只关注“事情对不对”而忽略了“别人开不开心”。',
    tips: ['偶尔尝试打破常规，接受新方法可能比老办法更有效。', '在指出别人错误前，先给予情感上的肯定。', '不必把所有责任都揽在自己身上，学会信任并授权给他人。'],
    careers: ['高级审计师', '财务总监', '供应链经理', '系统管理员', '法官']
  },
  ISFJ: {
    name: '守护者', title: '温柔坚定的后盾', slogan: '我会默默为你打理好一切。',
    core: '您极其善良、体贴，拥有极其细腻的观察力。您总是能在别人开口前察觉到他们的需求，并默默提供帮助。您重视传统和家庭，虽然性格内敛，但为了保护您所爱的人或捍卫您的责任，您能爆发出惊人的坚韧与力量。',
    work: '您是职场中任劳任怨、极其细心的中坚力量。在医疗护理、教育、行政后勤、客户服务等岗位上，您能提供最优质的服务。您不争名夺利，但往往是维系整个部门正常运转不可或缺的隐形轴心。',
    love: '您对感情极其认真，追求长久稳定的关系。您会在生活的每一个微小细节中照顾伴侣，是极佳的倾听者和支持者。但您习惯性地付出，往往容易忽视自己的需求。',
    blindSpot: '典型的“讨好型”倾向，极度害怕冲突，常常委屈自己去迎合他人；对过去的负面经验记忆极深，难以释怀；不敢为自己争取应得的利益和认可。',
    tips: ['你的善良必须带点锋芒，学会坚决地说“不”。', '不要总是把自己的需求排在最后，你同样值得被照顾。', '在职场上，学会适当地展示自己的工作成果，不要总是做默默无闻的雷锋。'],
    careers: ['护士长', '小学教师', '行政主管', '人力资源助理', '社工']
  },
  ESTJ: {
    name: '总经理', title: '高效强悍的实干派', slogan: '不要找借口，告诉我结果。',
    core: '您是天生的组织者和管理者，崇尚秩序、规则和绝对的效率。您务实而果断，看重事实和逻辑，对任何模糊不清或效率低下的事物深恶痛绝。您认为只有通过辛勤的努力和严格的纪律，才能构建起运转良好的系统。',
    work: '在企业管理、工厂运营、项目执行等领域，您是出色的带头人。您善于将复杂的任务拆解，分配给合适的人，并严格监督进度。您的团队往往能交出极高标准的答卷，尽管过程中可能会承受您带来的高压。',
    love: '您承担着家庭保护者和提供者的角色。您对伴侣忠诚，会把家庭生活规划得井井有条，确保物质上的富足。但您可能缺乏浪漫细胞，且希望家庭成员都能遵守您制定的“规矩”。',
    blindSpot: '控制欲极强，容易变成微观管理（Micromanagement）的暴君；对下属或伴侣的软弱、情感需求极度缺乏同理心，显得冷酷无情和固执己见。',
    tips: ['学会倾听，有时候你的员工或伴侣只是需要你的理解，而不是你的指令。', '接纳并非所有人都能达到你的标准，多用鼓励代替指责。', '柔化你的表达方式，培养情绪智力(EQ)。'],
    careers: ['企业高管', '项目经理', '银行行长', '厂长', '警官']
  },
  ESFJ: {
    name: '执政官', title: '热情周到的大家长', slogan: '只要大家都开心，我就满足了。',
    core: '您是极度热心、充满人情味的社交达人。您对周围人的情绪变化了如指掌，并以此为己任去维护每一个群体的和谐与快乐。您尊重传统，注重礼仪，在任何聚会或组织中，您都是那位热情招待所有人的核心人物。',
    work: '在客户关系管理、公关、医疗服务、酒店管理等需要大量人际交往的岗位上，您是无可替代的明星员工。您擅长记住每个客户的喜好，能用极高的情商化解矛盾，将团队打造成一个温馨的大家庭。',
    love: '在感情中，您毫无保留地付出，热衷于制造各种充满仪式感的纪念日。您极度渴望伴侣的肯定和感激。如果您付出了很多却得不到相应的回应，您会感到非常受伤和委屈。',
    blindSpot: '过分在意世俗的眼光和他人的评价，容易失去自我；在面临不得不做出的残酷决定（如开除员工、结束一段坏关系）时，会因为害怕伤害别人而优柔寡断。',
    tips: ['你的价值不依赖于别人的赞美，建立内在的自信。', '在帮助别人之前，先确认对方是否真的需要，避免过度干涉。', '允许自己偶尔做一个“自私”的人。'],
    careers: ['公关经理', '客服总监', '活动策划', '护士', '零售经理']
  },
  ISTP: {
    name: '鉴赏家', title: '冷静酷炫的手艺人', slogan: '别废话，动手解决它。',
    core: '您是冷静、随性且动手能力极强的实用主义者。您对复杂的机械、工具和系统有着本能的兴趣。您话不多，但总能在危机时刻保持绝对的冷静，用最直接、最高效的物理手段解决问题。您崇尚自由，讨厌被任何规则束缚。',
    work: '坐在办公室里开漫长的会议对您来说是折磨。您适合工程师、机修师、飞行员、外科医生或系统调试员等岗位。只要给您一套工具和一个难题，您就能沉浸在拆解与修复的乐趣中。',
    love: '您在感情中独立且有些神秘，不需要整天腻在一起。您不擅长用言语表达爱，但会在伴侣车坏了的时候，二话不说帮TA修好。您需要极大的私人空间，如果伴侣试图用条条框框控制您，您会迅速逃离。',
    blindSpot: '对人际交往中的情感变化极度迟钝，甚至显得有些冷漠；行事过于随性，缺乏长远规划，容易因为追求短期的刺激而陷入麻烦。',
    tips: ['练习用语言表达你的感受，你的伴侣不是会读心术的机器。', '尝试为自己的职业生涯制定一个三年规划，不要总是走到哪算哪。', '在团队合作中，偶尔分享一下你的思考过程，而不仅仅是交出结果。'],
    careers: ['机械工程师', '数据分析师', '特警', '飞行员', '系统测试员']
  },
  ISFP: {
    name: '探险家', title: '敏锐纯粹的灵魂画手', slogan: '我只跟从我内心的声音。',
    core: '您是安静、温柔且极具艺术天赋的随性者。您活在当下，用极其敏锐的感官去体验这个世界的色彩、声音和质感。您拥有独一无二的审美，内心充满热情，但不喜欢张扬，而是通过您的作品、穿搭或生活方式来表达自我。',
    work: '您抗拒死板的企业文化和严格的等级制度。在设计、摄影、美容、花艺、音乐创作等能够发挥您审美天赋且相对自由的领域，您能产出极具灵魂的作品。您需要工作环境友好且没有强烈的竞争压力。',
    love: '您在爱情中温婉而深情，能够敏锐地感知伴侣的需求，并创造充满美感和情调的共同记忆。但您极度厌恶冲突，当关系出现问题时，您更倾向于默默忍受或逃避，而不是直面沟通。',
    blindSpot: '过度活在当下导致极其缺乏长远规划和理财意识；因为害怕批评而常常陷入自我怀疑，难以承受高压环境；极易被外部环境和他人情绪影响。',
    tips: ['学会为自己的财务和未来设立一定的安全网。', '不要把客观的批评等同于对你个人的否定，学会在反馈中成长。', '当你不开心时，勇敢地说出来，不要指望别人能猜中你的心思。'],
    careers: ['独立设计师', '插画师', '摄影师', '调香师', '宠物理疗师']
  },
  ESTP: {
    name: '企业家', title: '活在当下的冒险家', slogan: '高风险，高回报！',
    core: '您是充满魅力、胆大心细的行动派。您拥有极强的洞察力和无可比拟的随机应变能力。在危机或高压环境下，您非但不会崩溃，反而会感到兴奋。您不喜欢空谈理论，更喜欢直接跳入充满刺激的现实世界，在边缘试探并赢取胜利。',
    work: '您是天生的销售冠军、连环创业者、职业投资者或危机公关。您极度擅长察言观色和捕捉稍纵即逝的商业机会。您能在充满不确定的市场中凭借敏锐的嗅觉杀出一条血路，是极其强悍的实战专家。',
    love: '您的魅力让您在情场上如鱼得水。和您在一起的生活充满刺激、惊喜和说走就走的旅行。但您可能害怕许下长久的承诺，容易对平淡的长期关系感到厌倦。',
    blindSpot: '为了追求短期的利益或刺激，常常无视规则和长远风险；缺乏耐心，讨厌深度的反思和复杂的理论分析；有时会因为行事过于冲动而给身边的人带来麻烦。',
    tips: ['在按下“发送”或“买入”按钮前，强迫自己停顿3分钟思考风险。', '培养对规则的敬畏之心，有些红线是绝对不能碰的。', '长久的成就不仅需要爆发力，更需要持之以恒的耐力。'],
    careers: ['职业投资人', '高级销售总监', '危机公关专家', '极限运动员', '连环创业者']
  },
  ESFP: {
    name: '娱乐家', title: '光芒万丈的舞台焦点', slogan: '人生苦短，必须性感！',
    core: '您是十二型人格中最懂得享受生活的人。您热情似火、幽默风趣，只要有您在的地方，就绝不会有冷场。您极其敏锐地感知周遭的视觉和情感刺激，热衷于将快乐传递给每一个人，是当之无愧的“派对动物”和社交中心。',
    work: '让您一个人闷在工位上看报表是极大的浪费。您极其适合演艺娱乐、公关、旅游体验、时尚美妆等光鲜亮丽且需要频繁与人打交道的行业。您惊人的亲和力能迅速搞定任何难缠的客户。',
    love: '在感情中，您热情主动，毫不吝啬地表达爱意。您总能给伴侣带来新鲜感和无尽的欢乐。但如果遇到生活中的重大挫折或需要沉下心来解决的长期矛盾，您可能会选择逃避或转移注意力。',
    blindSpot: '极其容易被外界诱惑分心，执行力和长期规划能力较弱；面对严肃或负面的问题时，习惯性用开玩笑来逃避；容易冲动消费，缺乏财务管理意识。',
    tips: ['快乐很重要，但直面痛苦也是成长的必经之路。', '把你的目标写下来，并找一个靠谱的人监督你的执行进度。', '每月强制储蓄，限制你的冲动消费冲动。'],
    careers: ['演员/艺人', '活动主持人', '时尚公关', '旅游达人', '品牌推广']
  }
}

const pInfo = computed(() => mbtiDict[personalityType.value] || mbtiDict['INTJ'])
</script>

<style scoped>
.mbti-results-container {
  color: #334155;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem;
}

/* 覆盖 Element Plus 默认样式 */
.section-card {
  margin-bottom: 2rem;
  border-radius: 16px;
  border: none;
  box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.05);
}

.hero-card {
  margin-bottom: 2.5rem;
  border-radius: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e0e7ff;
}

.hero-content {
  text-align: center;
  padding: 2rem 1rem;
}

.hero-subtitle {
  color: #64748b;
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.type-code {
  font-size: 5rem;
  font-weight: 900;
  color: #6366f1;
  margin: 0;
  letter-spacing: 0.1em;
  text-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.type-name {
  font-size: 1.8rem;
  color: #1e293b;
  margin-top: 0.5rem;
  margin-bottom: 1.5rem;
}

.type-slogan {
  font-size: 1.3rem;
  color: #8b5cf6;
  font-style: italic;
  font-weight: 600;
  margin-top: 1.5rem;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: #1e293b;
}

/* Bipolar Bar (保持自定义 CSS 以实现最佳效果) */
.dimensions-list {
  padding: 1rem 0;
}
.dimension-item {
  margin-bottom: 2rem;
}
.dimension-item:last-child {
  margin-bottom: 0;
}

.dim-info strong {
  display: block;
  font-size: 1.15rem;
  color: #334155;
  margin-bottom: 0.2rem;
}
.dim-desc {
  font-size: 0.9rem;
  color: #64748b;
}

.bipolar-bar-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.label-left, .label-right {
  min-width: 85px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #94a3b8;
  transition: color 0.3s;
}
.label-left { text-align: right; }
.label-right { text-align: left; }
.label-left.is-active { color: #f43f5e; }
.label-right.is-active { color: #10b981; }

.bipolar-bar {
  flex: 1;
  height: 24px;
  background: #f1f5f9;
  border-radius: 12px;
  display: flex;
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
}
.bar-center-line {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(255, 255, 255, 0.8);
  z-index: 2;
}
.bar-left {
  background: linear-gradient(90deg, #fb7185, #f43f5e);
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}
.bar-right {
  background: linear-gradient(90deg, #34d399, #10b981);
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.chart-caption {
  font-size: 0.85rem;
  color: #94a3b8;
  text-align: center;
  margin-top: 1rem;
}

/* 文本排版 */
.block-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #1e293b;
  margin-top: 0;
  margin-bottom: 0.8rem;
}
.mt-4 {
  margin-top: 2rem;
}
.block-text {
  font-size: 1.05rem;
  line-height: 1.8;
  color: #475569;
  text-align: justify;
  margin: 0;
}

.custom-alert :deep(.el-alert__title),
.custom-alert :deep(.el-alert__description) {
  font-size: 1rem;
  line-height: 1.6;
}

.tips-list {
  padding-left: 1.2rem;
  margin: 0;
}
.tips-list li {
  font-size: 1rem;
  line-height: 1.6;
  color: #475569;
  margin-bottom: 0.5rem;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
}
.career-tag {
  font-size: 0.95rem;
  padding: 0 16px;
  height: 32px;
  line-height: 30px;
}

/* 打印样式 */
.print-header, .print-footer { display: none; }

@media print {
  @page { size: A4; margin: 15mm; }
  body, .mbti-results-container { background: white !important; color: #000 !important; }
  
  .print-header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; font-weight: bold; }
  .print-footer { display: block; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center; font-size: 12px; color: #666; }
  
  .section-card, .hero-card { border: none !important; box-shadow: none !important; margin-bottom: 20px; padding: 0 !important; }
  .el-card__body { padding: 0 !important; }
  
  .bipolar-bar { border: 1px solid #ccc; background: #fff !important; }
  .bar-left, .bar-right { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .career-tag { border: 1px solid #6366f1 !important; color: #000 !important; background: transparent !important; }
}

@media (max-width: 768px) {
  .bipolar-bar-container { flex-direction: column; gap: 0.5rem; align-items: stretch; margin-top: 0.5rem; }
  .label-left { text-align: left; }
  .type-code { font-size: 4rem; }
}
</style>