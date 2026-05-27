<template>
  <PasswordProtection :module-key="testType" @verified="onPasswordVerified">
    <div class="md-test">
      <ParticleBackground />
      <!-- 导航栏 -->
      <nav class="test-nav">
        <button @click="$router.push('/')" class="nav-back">
          ← {{ $t("nav.back") }}
        </button>
        <h1 class="nav-title">{{ testTitle }}</h1>
        <div class="nav-progress" v-if="currentStep === 'questions'">
          {{ currentQuestion + 1 }} / {{ questions.length }}
        </div>
      </nav>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-section">
        <div class="container">
          <div class="loading-card">
            <div class="loading-spinner"></div>
            <p>{{ $t("test.loading") }}</p>
          </div>
        </div>
      </div>

      <!-- 介绍页面 -->
      <div v-else-if="currentStep === 'intro'" class="intro-section">
        <div class="container">
          <div class="intro-card">
            <div class="intro-header">
              <div class="test-icon">{{ testConfig.icon }}</div>
              <h2>{{ testTitle }}</h2>
              <p class="test-subtitle">{{ testConfig.subtitle }}</p>
            </div>

            <div class="intro-content" v-html="testDescription"></div>

            <div class="test-info">
              <div class="info-item">
                <span class="info-icon">📝</span>
                <span>{{
                  $t("test.questionsCount", { count: questions.length })
                }}</span>
              </div>
              <div class="info-item">
                <span class="info-icon">⏱️</span>
                <span>{{
                  $t("test.estimate", { minutes: testConfig.duration })
                }}</span>
              </div>
              <div class="info-item">
                <span class="info-icon">🎯</span>
                <span>{{
                  $t("test.accuracy", { value: testConfig.accuracy })
                }}</span>
              </div>
            </div>

            <button @click="startTest" class="start-btn">
              {{ $t("test.start") }}
            </button>
          </div>
        </div>
      </div>

      <!-- 问题页面 -->
      <div v-else-if="currentStep === 'questions'" class="questions-section">
        <div class="container">
          <div class="progress-container">
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: progressPercentage + '%' }"
              ></div>
            </div>
            <span class="progress-text">{{
              $t("test.progress", { percent: Math.round(progressPercentage) })
            }}</span>
            <span class="timer-display">⏱ {{ formatTime(elapsedSeconds) }}</span>
            <span class="auto-save-hint">💾 {{ $t("test.autoSave") }}</span>
          </div>

          <div class="question-card" v-if="questions[currentQuestion]">
            <div class="question-number">
              {{ $t("test.questionNumber", { n: currentQuestion + 1 }) }}
            </div>
            <div
              class="question-context"
              v-if="questions[currentQuestion].context"
            >
              <strong>{{ $t("test.context") }}：</strong
              >{{ questions[currentQuestion].context }}
            </div>
            <h3 class="question-text">
              {{ questions[currentQuestion].question }}
            </h3>

            <div class="options-container">
              <div
                v-for="(option, index) in questions[currentQuestion].options"
                :key="index"
                @click="selectAnswer(option)"
                class="option-item"
                :class="{ selected: selectedAnswer === option }"
              >
                <div class="option-content">
                  <span class="option-letter"
                    >{{ String.fromCharCode(65 + index) }}.</span
                  >
                  <span class="option-text">{{ option.text }}</span>
                  <span class="option-key-hint">{{ index + 1 }}</span>
                </div>
              </div>
            </div>

            <div class="navigation-buttons">
              <button
                @click="previousQuestion"
                :disabled="currentQuestion === 0"
                class="nav-btn prev-btn"
              >
                {{ $t("test.prev") }}
              </button>

              <button @click="cancelTest" class="nav-btn cancel-btn">
                ✕ {{ $t("test.cancel") }}
              </button>

              <button
                @click="nextQuestion"
                :disabled="!canProceed"
                class="nav-btn next-btn"
              >
                {{
                  currentQuestion === questions.length - 1
                    ? $t("test.viewResult")
                    : $t("test.next")
                }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 结果页面 -->
      <div v-else-if="currentStep === 'results'" class="results-section">
        <canvas v-if="confettiActive" id="confetti-canvas" class="confetti-canvas"></canvas>
        <div class="container">
          <div class="saved-notice">
            <span class="notice-icon">💾</span>
            <span>{{ $t("result.savedNotice") }}</span>
          </div>

          <div class="results-card">
            <component
              :is="getResultComponent()"
              :answers="answers"
              :questions="questions"
              :test-type="testType"
              @retake="retakeTest"
            />

            <div class="action-buttons">
              <button @click="printResults" class="action-btn print">
                <span class="btn-icon">🖨️</span>
                {{ $t("test.print") }}
              </button>
              <button @click="generateShareCard" class="action-btn share">
                <span class="btn-icon">📤</span>
                Share
              </button>
              <button @click="retakeTest" class="action-btn secondary">
                <span class="btn-icon">🔄</span>
                {{ $t("test.retake") }}
              </button>
              <button @click="$router.push('/')" class="action-btn primary">
                <span class="btn-icon">🏠</span>
                {{ $t("nav.back") }}
              </button>
            </div>
          </div>

          <!-- Share modal -->
          <div v-if="showShareModal" class="share-modal-overlay" @click.self="showShareModal = false">
            <div class="share-modal">
              <h3>Share Your Result</h3>
              <img :src="shareImage" alt="Result card" class="share-image" />
              <div class="share-modal-actions">
                <a :href="shareImage" download="test-result.png" class="action-btn primary">Download</a>
                <button @click="showShareModal = false" class="action-btn secondary">Close</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PasswordProtection>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { marked } from "marked";
import { useI18n } from "vue-i18n";

// 结果组件
import MBTIResults from "./results/MBTIResults.vue";
import EQResults from "./results/EQResults.vue";
import LearningStyleResults from "./results/LearningStyleResults.vue";
import BigFiveResults from "./results/BigFiveResults.vue";
import ParticleBackground from "./ParticleBackground.vue";
import PasswordProtection from "./PasswordProtection.vue";
import HollandResults from "./results/HollandResults.vue";
import EnneagramResults from './results/EnneagramResults.vue'
import DiscResults from './results/DiscResults.vue'
import ResilienceResults from './results/ResilienceResults.vue'
import SexualOrientationResults from './results/SexualOrientationResults.vue'

const route = useRoute();
const router = useRouter();
const testType = route.params.type || "mbti";
const { t, locale } = useI18n(); // 解构出 t 方法

const loading = ref(false); // 初始为 false，避免一开始就显示加载中
const currentStep = ref("intro"); // intro, questions, results
const currentQuestion = ref(0);
const answers = ref([]);
const selectedAnswer = ref(null);
const questions = ref([]);
const testTitle = ref("");
const testDescription = ref("");
const passwordVerified = ref(false);

// Timer
const elapsedSeconds = ref(0);
let timerInterval = null;

// Confetti
const confettiActive = ref(false);

// Share card
const shareImage = ref(null);
const showShareModal = ref(false);

// 测试配置
const testConfigs = {
  mbti: {
    title: "MBTI 性格测试",
    subtitle: "基于荣格心理类型理论的经典性格测试",
    icon: "🧩",
    duration: "10-15",
    accuracy: "95%",
    file: "/md/mbti-questions.md",
  },
  eq: {
    title: "情商测试",
    subtitle: "测试你的情绪智力水平",
    icon: "💝",
    duration: "8-12",
    accuracy: "92%",
    file: "/md/eq-questions.md",
  },
  "learning-style": {
    title: "学习风格测试",
    subtitle: "发现你最有效的学习方式",
    icon: "🎓",
    duration: "8-10",
    accuracy: "90%",
    file: "/md/learning-style-questions.md",
  },
  "big-five": {
    title: "五大人格测试",
    subtitle: "开放性、尽责性、外向性、宜人性、情绪稳定性（神经质）全面评估",
    icon: "🌊",
    duration: "10-15",
    accuracy: "93%",
    file: "/md/big-five-questions.md",
  },
  "holland-riasec": {
    title: "霍兰德职业兴趣测试",
    subtitle: "发现你的职业性格与理想工作环境",
    icon: "🧭",
    duration: "15-20",
    accuracy: "92%",
    file: "/md/holland-riasec-questions.md",
  },
  enneagram: {
    title: "九型人格深度测试",
    subtitle: "揭示您内在的核心动机、恐惧与欲望",
    icon: "🧿",
    duration: "15-20",
    accuracy: "93%",
    file: "/md/enneagram-questions.md",
  },
  disc: {
    title: "DISC 行为风格测试",
    subtitle: "精准刻画您的职场沟通模式与行为风格",
    icon: "🎯",
    duration: "10-15",
    accuracy: "94%",
    file: "/md/disc-questions.md",
  },
  resilience: {
    title: "心理韧性评估",
    subtitle: "衡量您在逆境中的恢复力与抗压能力",
    icon: "🛡️",
    duration: "8-12",
    accuracy: "91%",
    file: "/md/resilience-questions.md",
  },
  "sexual-orientation": {
    title: "性取向光谱评估",
    subtitle: "基于多元光谱理论，理解自己的性取向倾向",
    icon: "🌈",
    duration: "10-15",
    accuracy: "90%",
    file: "/md/sexual-orientation-questions.md",
  },
};

const testConfig = computed(() => testConfigs[testType] || testConfigs.mbti);

const progressPercentage = computed(() => {
  if (!questions.value.length) return 0;
  return ((currentQuestion.value + 1) / questions.value.length) * 100;
});

const canProceed = computed(() => {
  const savedAnswer = answers.value[currentQuestion.value];
  return Boolean(selectedAnswer.value || savedAnswer);
});

// 解析Markdown文件（支持中英文标题/标记）
const parseMarkdown = (content) => {
  const lines = content.split("\n");
  const parsedQuestions = [];
  let currentQuestion = null;
  let isInDescription = false;
  let description = "";
  // 支持的标题关键字（中英文）
  const descStartHeadings = new Set([
    "## 测试说明",
    "## Test Description",
    "## About the Test",
    "## Test Info",
  ]);
  const questionsStartHeadings = new Set(["## 测试题目", "## Questions"]);
  const contextPrefixes = [/^\*\*情境\*\*[：:]/, /^\*\*Context\*\*[：:]:?\s*/i];
  const questionPrefixes = [
    /^\*\*题目\*\*[：:]/,
    /^\*\*Question\*\*[：:]:?\s*/i,
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // 获取测试标题
    if (line.startsWith("# ") && !testTitle.value) {
      testTitle.value = line.substring(2);
      continue;
    }

    // 收集描述内容
    if (descStartHeadings.has(line)) {
      isInDescription = true;
      continue;
    }

    if (isInDescription && questionsStartHeadings.has(line)) {
      isInDescription = false;
      testDescription.value = marked(description);
      continue;
    }

    if (isInDescription && line) {
      description += line + "\n";
      continue;
    }

    // 遇到新的章节时（例如计分说明、结果解读）停止解析题目
    if (
      line.startsWith("## ") &&
      !questionsStartHeadings.has(line) &&
      (currentQuestion || parsedQuestions.length > 0)
    ) {
      if (currentQuestion) {
        parsedQuestions.push(currentQuestion);
        currentQuestion = null;
      }
      break;
    }

    // 解析题目
    if (line.startsWith("### ")) {
      if (currentQuestion) {
        parsedQuestions.push(currentQuestion);
      }

      const titleMatch = line.match(/### \d+\. (.+)/);
      currentQuestion = {
        title: titleMatch ? titleMatch[1] : line.substring(4),
        context: "",
        question: "",
        options: [],
      };
      continue;
    }

    // 解析情境
    if (contextPrefixes.some((re) => re.test(line))) {
      currentQuestion.context = line
        .replace(/\*\*情境\*\*[：:]\s*/, "")
        .replace(/\*\*Context\*\*[：:]:?\s*/i, "");
      continue;
    }

    // 解析题目文本
    if (questionPrefixes.some((re) => re.test(line))) {
      currentQuestion.question = line
        .replace(/\*\*题目\*\*[：:]\s*/, "")
        .replace(/\*\*Question\*\*[：:]:?\s*/i, "");
      continue;
    }

    // 解析选项
    if (line.match(/^- [A-D]\./)) {
      // 支持两种计分标记：*[X+1]* 或 [X+1]
      const optionMatch = line.match(
        /^- ([A-D])\. (.+?) (?:\*\[([^\]]+)\]\*|\[([^\]]+)\])\s*$/,
      );
      if (optionMatch) {
        const letter = optionMatch[1];
        const text = optionMatch[2];
        const scoringRaw = optionMatch[3] || optionMatch[4];
        currentQuestion.options.push({
          letter,
          text,
          scoring: parseScoringString(scoringRaw),
        });
      }
      continue;
    }
  }

  // 添加最后一个题目
  if (currentQuestion) {
    parsedQuestions.push(currentQuestion);
  }

  return parsedQuestions;
};

// 随机打乱选项顺序
const shuffleArray = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const shuffleQuestionOptions = (qList) => {
  for (const q of qList) {
    q.options = shuffleArray(q.options);
  }
};

// 解析计分字符串
const parseScoringString = (scoringStr) => {
  const scores = {};
  const parts = scoringStr.split(/[,，]/);

  parts.forEach((part) => {
    const trimmed = part.trim();
    // 处理MBTI计分格式 (E+2, I+3等)
    const mbtiMatch = trimmed.match(/([EISNTFJP])\+(\d+)/);
    if (mbtiMatch) {
      const [, dimension, score] = mbtiMatch;
      scores[dimension] = parseInt(score);
      return;
    }

    // 处理情商计分格式 (自我认知+2等)
    const eqMatch = trimmed.match(/(.+?)\+(\d+)/);
    if (eqMatch) {
      const [, dimension, score] = eqMatch;
      scores[dimension] = parseInt(score);
    }
  });

  return scores;
};

// 密码验证成功后的回调
const onPasswordVerified = () => {
  // 密码验证通过，初始化测试
  passwordVerified.value = true;
  initializeTest();
};

// 构造按语言优先的题库路径列表
const buildLocalizedPaths = () => {
  const basePath = testConfig.value.file.replace(/^\/+/, ""); // e.g. md/mbti-questions.md
  const fileName = basePath.split("/").pop();
  const current = locale.value || "zh-CN";
  const langOnly = current.split("-")[0];
  const baseUrl = import.meta.env.BASE_URL || "/";

  const normalize = (path) => {
    const normalized = path.replace(/^\/+/, "");
    return `${baseUrl}${normalized}`;
  };

  const candidates = [];
  candidates.push(normalize(`/md/${current}/${fileName}`));
  if (langOnly && langOnly !== current) {
    candidates.push(normalize(`/md/${langOnly}/${fileName}`));
  }
  candidates.push(normalize(`/${basePath}`));
  return candidates;
};

// 顺序尝试加载文件（有回退）
const fetchWithFallback = async (paths) => {
  let lastErr = null;
  for (const p of paths) {
    try {
      const res = await fetch(p);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const txt = await res.text();
      return { content: txt, path: p };
    } catch (e) {
      lastErr = e;
      // 继续尝试下一个候选
    }
  }
  throw lastErr || new Error("All fetch attempts failed");
};

// 加载测试文件（按语言回退）
const loadTest = async () => {
  try {
    loading.value = true;
    testTitle.value = "";
    testDescription.value = "";
    const candidates = buildLocalizedPaths();
    let fetched = await fetchWithFallback(candidates);
    questions.value = parseMarkdown(fetched.content);
    shuffleQuestionOptions(questions.value);

    // 如果解析到的问题数为 0，尝试回退到下一个候选文件
    if (!questions.value || questions.value.length === 0) {
      const currentIndex = candidates.indexOf(fetched.path);
      for (let i = currentIndex + 1; i < candidates.length; i++) {
        try {
          const alt = await fetchWithFallback([candidates[i]]);
          const altParsed = parseMarkdown(alt.content);
          if (altParsed && altParsed.length > 0) {
            fetched = alt;
            questions.value = altParsed;
            break;
          }
        } catch (_) {
          // 忽略并继续回退
        }
      }
    }

    // 如果没有从文件中获取到标题，使用配置的标题
    if (!testTitle.value) {
      testTitle.value = testConfig.value.title;
    }
  } catch (error) {
    console.error("加载测试文件失败:", error);
    // 使用默认配置
    testTitle.value = testConfig.value.title;
    testDescription.value = "无法加载测试描述";
    questions.value = [];
  } finally {
    loading.value = false;
  }
};

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const startTimer = () => {
  elapsedSeconds.value = 0;
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    elapsedSeconds.value++;
  }, 1000);
};

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

const startTest = () => {
  if (questions.value.length === 0) {
    alert("测试题目加载失败，请刷新页面重试");
    return;
  }
  currentStep.value = "questions";
  startTimer();
};

const selectAnswer = (option) => {
  selectedAnswer.value = option;
  // 自动保存进度（选择答案后）
  answers.value[currentQuestion.value] = option;
  saveProgressToStorage();
};

const nextQuestion = () => {
  const answer = selectedAnswer.value || answers.value[currentQuestion.value];
  if (!answer) return;

  answers.value[currentQuestion.value] = answer;

  if (currentQuestion.value < questions.value.length - 1) {
    currentQuestion.value++;
    selectedAnswer.value = answers.value[currentQuestion.value] || null;
    // 自动保存进度（切换题目后）
    saveProgressToStorage();
  } else {
    selectedAnswer.value = null;
    showResults();
  }
};

const previousQuestion = () => {
  if (currentQuestion.value > 0) {
    currentQuestion.value--;
    selectedAnswer.value = answers.value[currentQuestion.value] || null;
    // 自动保存进度（返回上一题后）
    saveProgressToStorage();
  }
};

const showResults = () => {
  stopTimer();
  currentStep.value = "results";
  saveResultsToStorage();
  triggerConfetti();
};

const retakeTest = () => {
  stopTimer();
  elapsedSeconds.value = 0;
  confettiActive.value = false;
  currentStep.value = "intro";
  currentQuestion.value = 0;
  answers.value = [];
  selectedAnswer.value = null;
  clearStoredResults();
};

const cancelTest = () => {
  const confirmCancel = confirm(t("test.cancelConfirm"));
  if (confirmCancel) {
    stopTimer();
    saveProgressToStorage();
    router.push("/");
  }
};

// 移除题目中的计分权重信息，仅保留展示所需字段
const stripScoring = (qList) => qList.map(q => ({
  title: q.title,
  context: q.context,
  question: q.question,
  options: q.options.map(o => ({ letter: o.letter, text: o.text }))
}))

// 保存测试进度（答题过程中）
const saveProgressToStorage = () => {
  if (currentStep.value === "questions" && answers.value.length > 0) {
    const progressData = {
      testType: testType,
      currentQuestion: currentQuestion.value,
      answers: answers.value,
      questions: stripScoring(questions.value),
      testTitle: testTitle.value,
      timestamp: new Date().toISOString(),
      isComplete: false,
    };
    localStorage.setItem(
      `test_progress_${testType}`,
      JSON.stringify(progressData),
    );
  }
};

// 保存结果到 localStorage（测试完成）
const saveResultsToStorage = () => {
  const resultData = {
    testType: testType,
    answers: answers.value,
    questions: stripScoring(questions.value),
    timestamp: new Date().toISOString(),
    testTitle: testTitle.value,
    elapsedSeconds: elapsedSeconds.value,
    isComplete: true,
  };
  localStorage.setItem(`test_result_${testType}`, JSON.stringify(resultData));

  // 追加到历史记录数组
  const historyRaw = localStorage.getItem("test_results_history");
  let history = [];
  try {
    history = historyRaw ? JSON.parse(historyRaw) : [];
  } catch (e) {
    history = [];
  }
  history.push(resultData);
  localStorage.setItem("test_results_history", JSON.stringify(history));

  // 清除进度数据
  localStorage.removeItem(`test_progress_${testType}`);
};

// 从 localStorage 恢复进度（答题过程中的进度）
const loadProgressFromStorage = () => {
  const stored = localStorage.getItem(`test_progress_${testType}`);
  if (stored) {
    try {
      const progressData = JSON.parse(stored);
      answers.value = progressData.answers;
      questions.value = progressData.questions;
      testTitle.value = progressData.testTitle;
      currentQuestion.value = progressData.currentQuestion;
      selectedAnswer.value = answers.value[currentQuestion.value] || null;
      currentStep.value = "questions";
      loading.value = false;
      return true;
    } catch (e) {
      console.error("加载保存的进度失败:", e);
      loading.value = false;
      return false;
    }
  }
  return false;
};

// 从 localStorage 恢复结果（测试完成的结果）
const loadResultsFromStorage = () => {
  const stored = localStorage.getItem(`test_result_${testType}`);
  if (stored) {
    try {
      const resultData = JSON.parse(stored);
      answers.value = resultData.answers;
      questions.value = resultData.questions;
      testTitle.value = resultData.testTitle;
      currentStep.value = "results";
      loading.value = false; // 重要：恢复结果后关闭加载状态
      return true;
    } catch (e) {
      console.error("加载保存的结果失败:", e);
      loading.value = false; // 出错时也要关闭加载状态
      return false;
    }
  }
  return false;
};

// 清除保存的结果和进度
const clearStoredResults = () => {
  localStorage.removeItem(`test_result_${testType}`);
  localStorage.removeItem(`test_progress_${testType}`);
};

const resetTestState = () => {
  currentStep.value = "intro";
  currentQuestion.value = 0;
  answers.value = [];
  selectedAnswer.value = null;
  questions.value = [];
  testTitle.value = "";
  testDescription.value = "";
};

// 键盘快捷键
const handleKeydown = (e) => {
  if (currentStep.value !== "questions") return;
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

  const opts = questions.value[currentQuestion.value]?.options || [];
  const key = e.key;

  if (key >= "1" && key <= String(Math.min(opts.length, 9))) {
    e.preventDefault();
    selectAnswer(opts[parseInt(key) - 1]);
  } else if (key === "Enter") {
    e.preventDefault();
    if (canProceed.value) nextQuestion();
  } else if (key === "Backspace") {
    e.preventDefault();
    previousQuestion();
  }
};

// 撒花动画
const triggerConfetti = () => {
  confettiActive.value = true;
  setTimeout(() => {
    const canvas = document.getElementById("confetti-canvas");
    if (!canvas) {
      confettiActive.value = false;
      return;
    }

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = [
      "#6366f1", "#10b981", "#f59e0b", "#ef4444",
      "#3b82f6", "#ec4899", "#8b5cf6", "#14b8a6",
    ];
    const particles = [];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        w: Math.random() * 10 + 5,
        h: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rv: (Math.random() - 0.5) * 10,
        opacity: 1,
      });
    }

    let frame = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rv;
        p.vy += 0.05;
        p.opacity -= 0.003;

        if (p.opacity <= 0) continue;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      frame++;
      if (frame < 180) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        confettiActive.value = false;
      }
    };

    requestAnimationFrame(animate);
  }, 200);
};

// 计算维度分数
const computeScores = () => {
  const scores = {};
  for (const ans of answers.value) {
    if (!ans?.scoring) continue;
    for (const [dim, score] of Object.entries(ans.scoring)) {
      scores[dim] = (scores[dim] || 0) + score;
    }
  }
  return scores;
};

// 生成分享卡片图片
const generateShareCard = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 420;
  const ctx = canvas.getContext("2d");

  // 背景
  const gradient = ctx.createLinearGradient(0, 0, 600, 420);
  gradient.addColorStop(0, "#6366f1");
  gradient.addColorStop(1, "#8b5cf6");
  ctx.fillStyle = gradient;
  ctx.roundRect(0, 0, 600, 420, 16);
  ctx.fill();

  // 装饰圆
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(80 + i * 120, 50, 35 + i * 12, 0, Math.PI * 2);
    ctx.fill();
  }

  // 测试标题
  ctx.fillStyle = "white";
  ctx.font = "bold 26px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(testTitle.value, 300, 95);

  // 日期和用时
  ctx.font = "15px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  const d = new Date();
  ctx.fillText(
    `${d.toLocaleDateString()}  ·  ${formatTime(elapsedSeconds.value)}`,
    300, 130
  );

  // 分隔线
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, 155);
  ctx.lineTo(520, 155);
  ctx.stroke();

  // 题目数
  ctx.font = "16px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText(`${questions.value.length} 题`, 300, 190);

  // 维度分数
  const dimensionScores = computeScores();
  const entries = Object.entries(dimensionScores);
  const maxScore = Math.max(...entries.map(([, v]) => v), 1);
  let y = 225;

  ctx.font = "14px -apple-system, BlinkMacSystemFont, sans-serif";
  for (const [dim, score] of entries.slice(0, 6)) {
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.textAlign = "right";
    ctx.fillText(dim, 145, y + 4);

    const barWidth = (score / maxScore) * 210;
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.beginPath();
    ctx.roundRect(155, y - 7, 210, 16, 4);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.roundRect(155, y - 7, barWidth, 16, 4);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.textAlign = "left";
    ctx.fillText(String(score), 375, y + 4);

    y += 30;
  }

  // 底部
  ctx.font = "12px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.textAlign = "right";
  ctx.fillText("Personality Test Center", 520, 395);

  shareImage.value = canvas.toDataURL("image/png");
  showShareModal.value = true;
};

// 打印结果
const printResults = () => {
  window.print();
};

const getResultComponent = () => {
  switch (testType) {
    case "mbti":
      return MBTIResults;
    case "eq":
      return EQResults;
    case "learning-style":
      return LearningStyleResults;
    case "big-five":
      return BigFiveResults;
    case "holland-riasec":
      return HollandResults;
    case "enneagram":
      return EnneagramResults;
    case "disc":
      return DiscResults;
    case "resilience":
      return ResilienceResults;
    case "sexual-orientation":
      return SexualOrientationResults;
    default:
      return MBTIResults;
  }
};

// 初始化测试（密码验证后调用）
const initializeTest = () => {
  // 优先级1: 尝试加载答题进度（未完成的测试）
  const hasProgress = loadProgressFromStorage();
  if (hasProgress) {
    return; // 找到进度，直接返回
  }

  // 优先级2: 尝试加载完成的测试结果
  const hasStoredResults = loadResultsFromStorage();
  if (hasStoredResults) {
    return; // 找到结果，直接返回
  }

  // 优先级3: 没有保存的数据，加载测试
  loadTest();
};

watch(locale, async (newLocale, oldLocale) => {
  if (!passwordVerified.value) return;
  if (!newLocale || newLocale === oldLocale) return;
  clearStoredResults();
  resetTestState();
  try {
    await loadTest();
  } catch (e) {
    console.error("切换语言后加载测试失败:", e);
  }
});

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  stopTimer();
});
</script>

<style scoped>
.md-test {
  min-height: 100vh;
  background: var(--color-bg);
  position: relative;
}

.test-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 2rem;
  background: var(--color-surface);
  box-shadow: 0 2px 8px var(--color-card-shadow);
  position: relative;
  z-index: 10;
}

.nav-back {
  background: var(--color-surface);
  border: 2px solid var(--color-primary-light);
  color: var(--color-primary);
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

.nav-back:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
  transform: translateX(-4px);
}

.nav-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-text-heading);
}

.nav-progress {
  font-size: 0.95rem;
  color: var(--color-text-muted);
  font-weight: 600;
  background: var(--color-divider);
  padding: 0.5rem 1rem;
  border-radius: 20px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
  z-index: 1;
}

/* 加载状态 */
.loading-section {
  padding: 4rem 0;
}

.loading-card {
  background: var(--color-surface);
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 4px 20px var(--color-card-shadow);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--color-primary-light);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.loading-card p {
  color: var(--color-text-muted);
  font-weight: 500;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 介绍页面样式 */
.intro-section {
  padding: 2rem 0;
}

.intro-card {
  background: var(--color-surface);
  border-radius: 24px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 4px 20px var(--color-card-shadow);
}

.intro-header {
  margin-bottom: 3rem;
}

.test-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  filter: drop-shadow(0 4px 8px rgba(99, 102, 241, 0.2));
}

.intro-header h2 {
  font-size: 2.5rem;
  margin-bottom: 0.8rem;
  font-weight: 800;
  color: var(--color-text-heading);
}

.test-subtitle {
  font-size: 1.2rem;
  color: var(--color-text-muted);
  margin-bottom: 2rem;
  font-weight: 500;
}

.intro-content {
  text-align: left;
  margin-bottom: 2rem;
  background: var(--color-surface-hover);
  padding: 2rem;
  border-radius: 16px;
  border-left: 4px solid var(--color-primary);
}

.intro-content :deep(h3) {
  color: var(--color-primary);
  margin-bottom: 1rem;
  font-weight: 700;
}

.intro-content :deep(p) {
  line-height: 1.8;
  margin-bottom: 1rem;
  color: var(--color-text-secondary);
}

.intro-content :deep(ul) {
  margin-left: 1.5rem;
  color: var(--color-text-secondary);
  line-height: 1.8;
}

.test-info {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin: 2rem 0;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: var(--color-divider);
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  color: var(--color-text-secondary);
  font-weight: 600;
}

.info-icon {
  font-size: 1.3rem;
}

.start-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 1.1rem 3rem;
  font-size: 1.15rem;
  font-weight: 700;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 2rem;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.start-btn:hover {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
}

/* 问题页面样式 */
.questions-section {
  padding: 2rem 0;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  background: var(--color-surface);
  padding: 1rem 1.5rem;
  border-radius: 16px;
  box-shadow: 0 2px 8px var(--color-card-shadow);
  position: relative;
  flex-wrap: wrap;
}

.progress-bar {
  flex: 1;
  height: 10px;
  background: var(--color-primary-light);
  border-radius: 10px;
  overflow: hidden;
  min-width: 120px;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.3s ease;
  border-radius: 10px;
}

.progress-text {
  font-weight: 700;
  color: var(--color-primary);
  min-width: 80px;
  text-align: right;
}

.timer-display {
  font-weight: 700;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.auto-save-hint {
  font-size: 0.85rem;
  color: var(--color-success);
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  background: var(--color-success-light);
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

.question-card {
  background: var(--color-surface);
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 4px 20px var(--color-card-shadow);
}

.question-number {
  color: var(--color-primary);
  font-weight: 700;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.question-context {
  background: var(--color-warning-light);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  font-style: italic;
  color: #92400e;
  border-left: 4px solid var(--color-warning);
}

.question-text {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 2rem;
  line-height: 1.5;
  color: var(--color-text-heading);
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.option-item {
  background: var(--color-surface-hover);
  border: 2px solid var(--color-border);
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.option-item:hover {
  background: var(--color-divider);
  border-color: var(--color-border-hover);
  transform: translateX(4px);
}

.option-item.selected {
  background: var(--color-primary-bg);
  border-color: var(--color-primary);
  transform: translateX(8px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.option-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.option-letter {
  font-weight: 700;
  color: var(--color-primary);
  min-width: 28px;
  font-size: 1.1rem;
}

.option-text {
  font-size: 1.05rem;
  line-height: 1.6;
  flex: 1;
  color: var(--color-text-secondary);
}

.option-key-hint {
  font-size: 0.75rem;
  color: var(--color-text-sub);
  background: var(--color-divider);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 2px 7px;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
  align-self: center;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.nav-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.prev-btn {
  background: var(--color-surface);
  color: var(--color-primary);
  border: 2px solid var(--color-primary-light);
}

.prev-btn:hover:not(:disabled) {
  background: var(--color-divider);
  border-color: var(--color-primary);
}

.prev-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.cancel-btn {
  background: var(--color-surface);
  color: var(--color-danger);
  border: 2px solid var(--color-danger-light);
}

.cancel-btn:hover {
  background: var(--color-danger-light);
  border-color: var(--color-danger);
}

.next-btn {
  background: var(--color-primary);
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.next-btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
}

.next-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* 结果页面样式 */
.results-section {
  padding: 2rem 0;
  position: relative;
}

.confetti-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  pointer-events: none;
}

.saved-notice {
  background: #67c23a;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.2);
  font-weight: 600;
  animation: slideDown 0.5s ease;
}

.notice-icon {
  font-size: 1.3em;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.results-card {
  background: var(--color-surface);
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 4px 20px var(--color-card-shadow);
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 3rem;
  flex-wrap: wrap;
}

.action-btn {
  padding: 1rem 2.5rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-btn.secondary {
  background: var(--color-surface);
  color: var(--color-primary);
  border: 2px solid var(--color-primary-light);
}

.action-btn.secondary:hover {
  background: var(--color-divider);
  border-color: var(--color-primary);
}

.action-btn.primary {
  background: var(--color-primary);
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.action-btn.primary:hover {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
}

.action-btn.print {
  background: var(--color-success);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.action-btn.print:hover {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.action-btn.share {
  background: var(--color-info);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.action-btn.share:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.btn-icon {
  margin-right: 0.5rem;
  font-size: 1.2em;
}

/* Share modal */
.share-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--color-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.share-modal {
  background: var(--color-surface);
  border-radius: 20px;
  padding: 2rem;
  max-width: 620px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.share-modal h3 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: var(--color-text-heading);
}

.share-image {
  width: 100%;
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

.share-modal-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

/* 打印样式 */
@media print {
  .test-nav,
  .action-buttons,
  .particle-background,
  .confetti-canvas,
  .share-modal-overlay {
    display: none !important;
  }

  .results-section {
    padding: 0;
  }

  .results-card {
    box-shadow: none;
    border: 1px solid var(--color-border);
    padding: 1.5rem;
  }

  body {
    background: white !important;
  }

  .md-test {
    background: white !important;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  .intro-card,
  .question-card,
  .results-card {
    padding: 2rem;
  }

  .test-nav {
    padding: 1rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .nav-title {
    font-size: 1.2rem;
  }

  .test-info {
    flex-direction: column;
    align-items: center;
  }

  .navigation-buttons {
    flex-direction: column;
  }

  .nav-btn {
    width: 100%;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
