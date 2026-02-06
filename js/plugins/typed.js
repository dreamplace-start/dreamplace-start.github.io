export const config = {
  usrTypeSpeed: theme.home_banner.subtitle.typing_speed,
  usrBackSpeed: theme.home_banner.subtitle.backing_speed,
  usrBackDelay: theme.home_banner.subtitle.backing_delay,
  usrStartDelay: theme.home_banner.subtitle.starting_delay,
  usrLoop: theme.home_banner.subtitle.loop,
  usrSmartBackspace: theme.home_banner.subtitle.smart_backspace,
  usrHitokotoAPI: theme.home_banner.subtitle.hitokoto.api,
};

// 封装一言请求（带防重复基础保护）
function fetchHitokotoText() {
  const { usrHitokotoAPI } = config;
  return fetch(usrHitokotoAPI)
    .then((res) => res.json())
    .then((data) => {
      const text = data.hitokoto;
      const from = data.from_who && theme.home_banner.subtitle.hitokoto.show_author
        ? data.from_who
        : '佚名';

      return `${text} —— ${from}`;
    })
    .catch((err) => {
      console.error('Hitokoto fetch failed:', err);
      return '心有所念，却未能成句…';
    });
}

export default function initTyped(id) {
  const el = document.getElementById(id);
  if (!el) return;

  const {
    usrTypeSpeed,
    usrBackSpeed,
    usrBackDelay,
    usrStartDelay,
    usrLoop,
    usrSmartBackspace,
  } = config;

  const isHitokotoEnabled = theme.home_banner.subtitle.hitokoto.enable;

  // 构建基础配置
  const baseConfig = {
    typeSpeed: usrTypeSpeed || 100,
    backSpeed: usrBackSpeed || 80,
    backDelay: usrBackDelay || 1500,
    startDelay: usrStartDelay || 500,
    showCursor: true,
    smartBackspace: usrSmartBackspace ?? false, // 尊重用户设置
  };

  if (isHitokotoEnabled) {
    // 🔥 关键：强制开启 loop，否则无法触发 onLoopComplete
    const typedConfig = {
      ...baseConfig,
      loop: true, // 强制循环，确保能持续触发更新
    };

    let st; // 存储实例

    // 初始化并开始轮播
    function loadAndType() {
      fetchHitokotoText().then((text) => {
        if (st) {
          st.destroy(); // 销毁旧实例
          el.innerHTML = ''; // 清空 DOM
        }

        st = new Typed('#' + id, {
          ...typedConfig,
          strings: [text],
          onLoopComplete: () => {
            // 每次循环完成后加载下一句
            console.log('[Hitokoto] 开始加载新句子...');
            loadAndType(); // 递归调用，形成无限流动
          },
        });
      });
    }

    // 启动第一句
    loadAndType();

  } else {
    // 非一言模式：使用静态文本列表，尊重原始 loop 设置
    const sentenceList = [...theme.home_banner.subtitle.text];
    if (sentenceList.length > 0) {
      new Typed('#' + id, {
        ...baseConfig,
        loop: usrLoop || false,
        strings: sentenceList,
      });
    }
  }
}
