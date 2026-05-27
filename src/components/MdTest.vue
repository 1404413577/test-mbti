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
        <div class="container">
          <!-- 结果已保存提示 -->
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
        </div>
      </div>
    </div>
  </PasswordProtection>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
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

const startTest = () => {
  if (questions.value.length === 0) {
    alert("测试题目加载失败，请刷新页面重试");
    return;
  }
  currentStep.value = "questions";
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
  currentStep.value = "results";
  // 保存结果到 localStorage
  saveResultsToStorage();
};

const retakeTest = () => {
  currentStep.value = "intro";
  currentQuestion.value = 0;
  answers.value = [];
  selectedAnswer.value = null;
  // 清除保存的结果
  clearStoredResults();
};

const cancelTest = () => {
  const confirmCancel = confirm(t("test.cancelConfirm"));
  if (confirmCancel) {
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
    isComplete: true,
  };
  localStorage.setItem(`test_result_${testType}`, JSON.stringify(resultData));
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
  // 什么都不做，等待密码验证通过
  // 密码验证组件会在验证通过后调用 onPasswordVerified
});
</script>

<style scoped>
.md-test {
  min-height: 100vh;
  background: #f5f7fa;
  position: relative;
}

.test-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 2rem;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: relative;
  z-index: 10;
}

.nav-back {
  background: white;
  border: 2px solid #e0e7ff;
  color: #6366f1;
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

.nav-back:hover {
  background: #6366f1;
  color: white;
  border-color: #6366f1;
  transform: translateX(-4px);
}

.nav-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0;
  color: #1e293b;
}

.nav-progress {
  font-size: 0.95rem;
  color: #64748b;
  font-weight: 600;
  background: #f1f5f9;
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
  background: white;
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e0e7ff;
  border-top: 4px solid #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.loading-card p {
  color: #64748b;
  font-weight: 500;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 介绍页面样式 */
.intro-section {
  padding: 2rem 0;
}

.intro-card {
  background: white;
  border-radius: 24px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
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
  color: #1e293b;
}

.test-subtitle {
  font-size: 1.2rem;
  color: #64748b;
  margin-bottom: 2rem;
  font-weight: 500;
}

.intro-content {
  text-align: left;
  margin-bottom: 2rem;
  background: #f8fafc;
  padding: 2rem;
  border-radius: 16px;
  border-left: 4px solid #6366f1;
}

.intro-content :deep(h3) {
  color: #6366f1;
  margin-bottom: 1rem;
  font-weight: 700;
}

.intro-content :deep(p) {
  line-height: 1.8;
  margin-bottom: 1rem;
  color: #475569;
}

.intro-content :deep(ul) {
  margin-left: 1.5rem;
  color: #475569;
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
  background: #f1f5f9;
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  color: #475569;
  font-weight: 600;
}

.info-icon {
  font-size: 1.3rem;
}

.start-btn {
  background: #6366f1;
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
  background: #4f46e5;
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
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: relative;
}

.progress-bar {
  flex: 1;
  height: 10px;
  background: #e0e7ff;
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #6366f1;
  transition: width 0.3s ease;
  border-radius: 10px;
}

.progress-text {
  font-weight: 700;
  color: #6366f1;
  min-width: 80px;
  text-align: right;
}

.auto-save-hint {
  font-size: 0.85rem;
  color: #10b981;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  background: #d1fae5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.question-card {
  background: white;
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.question-number {
  color: #6366f1;
  font-weight: 700;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.question-context {
  background: #fef3c7;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  font-style: italic;
  color: #92400e;
  border-left: 4px solid #f59e0b;
}

.question-text {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 2rem;
  line-height: 1.5;
  color: #1e293b;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.option-item {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.option-item:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateX(4px);
}

.option-item.selected {
  background: #ede9fe;
  border-color: #6366f1;
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
  color: #6366f1;
  min-width: 28px;
  font-size: 1.1rem;
}

.option-text {
  font-size: 1.05rem;
  line-height: 1.6;
  flex: 1;
  color: #475569;
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
  background: white;
  color: #6366f1;
  border: 2px solid #e0e7ff;
}

.prev-btn:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #6366f1;
}

.prev-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.cancel-btn {
  background: white;
  color: #ef4444;
  border: 2px solid #fee2e2;
}

.cancel-btn:hover {
  background: #fef2f2;
  border-color: #ef4444;
}

.next-btn {
  background: #6366f1;
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.next-btn:hover:not(:disabled) {
  background: #4f46e5;
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
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.results-card {
  background: white;
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 3rem;
}

.action-btn {
  padding: 1rem 2.5rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.secondary {
  background: white;
  color: #6366f1;
  border: 2px solid #e0e7ff;
}

.action-btn.secondary:hover {
  background: #f1f5f9;
  border-color: #6366f1;
}

.action-btn.primary {
  background: #6366f1;
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.action-btn.primary:hover {
  background: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
}

.action-btn.print {
  background: #10b981;
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.action-btn.print:hover {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.btn-icon {
  margin-right: 0.5rem;
  font-size: 1.2em;
}

/* 打印样式 */
@media print {
  .test-nav,
  .action-buttons,
  .particle-background {
    display: none !important;
  }

  .results-section {
    padding: 0;
  }

  .results-card {
    box-shadow: none;
    border: 1px solid #e0e7ff;
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
