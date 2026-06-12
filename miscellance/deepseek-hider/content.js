(function() {
    'use strict';

    // ==================== 配置对象（已根据最新DOM结构更新） ====================
    const config = {
        // 要隐藏的元素选择器列表（新增了两个，并保留原有部分选择器）
        selectorsToHide: [
            // --- 新增元素 1：胶囊按钮 ---
            "#root > div > div.c3ecdb44 > div._7780f2e > div > div._2be88ba > div.ds-button.ds-button--iconLabelPrimary.ds-button--icon.ds-button--capsule.ds-button--l.ds-button--icon-relative-m._57370c5._5dedc1e",
            // --- 新增元素 2：虚拟列表内的特定 div ---
            "#root > div > div.c3ecdb44 > div._7780f2e > div > div.ds-virtual-list.ds-virtual-list--printable.ds-scroll-area.ds-scroll-area--show-on-focus-within.ds-scroll-area--enabled._2bd7b35 > div._871cbca",
            // 原头部元素（若仍有效则保留）
            "#root > div > div.c3ecdb44 > div._7780f2e > div > div._2be88ba",
            "#root > div > div.c3ecdb44 > div._7780f2e > div > div._2be88ba > div.f8d1e4c0.the-header",
            // 原其他可能有效的隐藏项
            "#root > div > div.c3ecdb44 > div._7780f2e > div > div._2bd7b35 > div > div.ca1ef5b2.ds-scroll-area > div._871cbca",
            "#root > div > div.c3ecdb44 > div.dc04ec1d > div",
            "#root > div > div.c3ecdb44 > div._7780f2e > div > div._3919b83 > div > div._0f72b0b.ds-scroll-area > div._871cbca"
        ],

        // 普通样式修改（保持不变，若部分失效可自行调整）
        stylesToModify: [
            {
                selector: "#root > div > div.c3ecdb44 > div._7780f2e > div > div._2bd7b35 > div > div.ca1ef5b2.ds-scroll-area",
                styles: {
                    "padding-left": "0px",
                    "padding-right": "0px"
                }
            },
            {
                selector: "#root > div > div.c3ecdb44 > div._7780f2e > div > div.ds-virtual-list.ds-virtual-list--printable.ds-scroll-area.ds-scroll-area--show-on-focus-within.ds-scroll-area--enabled._2bd7b35 > div.ds-virtual-list-items._6f2c522",
                styles: {
                    "padding-left": "0px",
                    "padding-right": "0px"
                }
            },
            {
                selector: "#root > div > div.c3ecdb44 > div._7780f2e > div > div._3919b83 > div > div._0f72b0b.ds-scroll-area > div.dad65929 > div._4f9bf79.d7dc56a8._43c05b5 > div.ds-message._63c77b1 > div.ds-markdown > div",
                styles: {
                    "margin-left": "0px"
                }
            }
        ],

        // 目标透明度元素的多重备选选择器（保留原样）
        targetOpacitySelectors: [
            "#root > div > div.c3ecdb44 > div._7780f2e > div > div.ds-virtual-list.ds-virtual-list--printable.ds-scroll-area.ds-scroll-area--show-on-focus-within.ds-scroll-area--enabled._2bd7b35 > div._871cbca > div.aaff8b8f > div._77cefa5._3d616d3",
            "#root div[class*='_7780f2e'] div[class*='scroll-area'] > div[class*='_871cbca']",
            "#root div[class*='scroll-area'] > div[class*='_871cbca']"
        ],

        targetOpacity: "0.5",
        isHidden: true,
        originalStyles: new Map(),

        // ★ 修复后的滚动容器选择器（使用你提供的深层滚动元素）
        scrollContainerSelector: "#root > div > div.c3ecdb44 > div.dc04ec1d > div > div._3586175.ds-scroll-area.ds-scroll-area--show-on-focus-within.ds-scroll-area--enabled > div._6d215eb.ds-scroll-area.ds-scroll-area--show-on-focus-within.ds-scroll-area--enabled",

        stopLoading: false
    };

    // ==================== 自动滚动加载所有会话 ====================
    async function autoScrollLoad() {
        console.log('开始自动下滑加载所有会话...');

        const container = document.querySelector(config.scrollContainerSelector);
        if (!container) {
            console.error('❌ 未找到滚动容器，选择器可能已失效，请重新获取。继续执行后续操作。');
            return;
        }

        console.log('容器高度信息：', container.scrollHeight, container.clientHeight);
        console.log('overflowY:', getComputedStyle(container).overflowY);

        let previousHeight = container.scrollHeight;
        let noNewDataCount = 0;
        const maxNoNewData = 3;

        while (noNewDataCount < maxNoNewData && !config.stopLoading) {
            container.scrollTo(0, container.scrollHeight);
            console.log('已滚动到底部，等待加载...');
            await new Promise(resolve => setTimeout(resolve, 2000));

            if (config.stopLoading) {
                console.log('⏹️ 检测到 Ctrl+Z，停止加载');
                break;
            }

            const newHeight = container.scrollHeight;
            if (newHeight === previousHeight) {
                noNewDataCount++;
                console.log(`第 ${noNewDataCount} 次滚动后高度无变化`);
            } else {
                noNewDataCount = 0;
                console.log(`高度从 ${previousHeight} 变为 ${newHeight}，继续加载`);
                previousHeight = newHeight;
            }
        }

        if (config.stopLoading) {
            console.log('✅ 已根据用户指令中断加载');
        } else {
            console.log('✅ 所有会话已加载完毕！');
        }
    }

    // ==================== 带重试的目标透明度查找 ====================
    async function findTargetWithRetry(maxAttempts = 5, interval = 500) {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            for (const selector of config.targetOpacitySelectors) {
                try {
                    const el = document.querySelector(selector);
                    if (el) {
                        console.log(`第 ${attempt} 次尝试：找到目标透明度元素，使用选择器: ${selector}`);
                        return el;
                    }
                } catch (e) {}
            }
            if (attempt < maxAttempts) {
                console.log(`第 ${attempt} 次尝试未找到目标元素，等待 ${interval}ms 后重试...`);
                await new Promise(resolve => setTimeout(resolve, interval));
            }
        }
        console.warn(`经过 ${maxAttempts} 次尝试仍未找到目标透明度元素，请更新备选选择器`);
        return null;
    }

    // ==================== 元素隐藏/显示 ====================
    function hideElements() {
        config.selectorsToHide.forEach(selector => {
            try {
                document.querySelectorAll(selector).forEach(el => {
                    if (!config.originalStyles.has(el)) {
                        config.originalStyles.set(el, el.style.display);
                    }
                    el.style.display = 'none';
                });
            } catch (e) {}
        });
    }

    function showElements() {
        config.selectorsToHide.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                if (config.originalStyles.has(el)) {
                    el.style.display = config.originalStyles.get(el) || '';
                }
            });
        });
    }

    // ==================== 样式修改 ====================
    async function modifyStyles() {
        // 1. 应用普通样式修改
        config.stylesToModify.forEach(item => {
            try {
                document.querySelectorAll(item.selector).forEach(el => {
                    Object.keys(item.styles).forEach(prop => {
                        el.style[prop] = item.styles[prop];
                    });
                });
            } catch (e) {}
        });

        // 2. 使用带重试的机制查找目标透明度元素
        const targetEl = await findTargetWithRetry(5, 500);
        if (targetEl) {
            targetEl.style.opacity = config.targetOpacity;
        }
    }

    // ==================== 主控制函数 ====================
    function toggleElements() {
        config.stopLoading = true;

        if (config.isHidden) {
            showElements();
            config.isHidden = false;
            showNotification('已显示隐藏的元素', '#4CAF50');
        } else {
            hideElements();
            config.isHidden = true;
            showNotification('已隐藏指定元素', '#2196F3');
        }
        modifyStyles();
    }

    function showNotification(msg, color) {
        const old = document.getElementById('deepseek-hider-notification');
        if (old) old.remove();
        const noti = document.createElement('div');
        noti.id = 'deepseek-hider-notification';
        noti.textContent = msg;
        noti.style.cssText = `
            position: fixed; top: 20px; right: 20px; background: ${color}; color: white;
            padding: 12px 18px; border-radius: 6px; z-index: 10001;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            font-size: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: all 0.3s ease; max-width: 300px; word-wrap: break-word; font-weight: 500;
        `;
        document.body.appendChild(noti);
        setTimeout(() => {
            noti.style.opacity = '0';
            noti.style.transform = 'translateX(20px)';
            setTimeout(() => noti.remove(), 300);
        }, 3000);
    }

    async function applyAllChanges() {
        if (config.isHidden) hideElements(); else showElements();
        await modifyStyles();
        setTimeout(() => modifyStyles(), 500);
        setTimeout(() => modifyStyles(), 2000);
    }

    // ==================== 快捷键 ====================
    function setupShortcutListener() {
        document.addEventListener('keydown', e => {
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                toggleElements();
            }
        });
    }

    // ==================== 观察器 ====================
    function setupEnhancedObservers() {
        const observer = new MutationObserver(mutations => {
            let shouldUpdate = false;
            for (const m of mutations) {
                if (m.type === 'childList' && m.addedNodes.length) {
                    shouldUpdate = true;
                    break;
                }
            }
            if (shouldUpdate) {
                setTimeout(() => modifyStyles(), 300);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });

        setInterval(() => modifyStyles(), 5000);
    }

    // ==================== 初始化 ====================
    async function init() {
        setupShortcutListener();
        setupEnhancedObservers();
        await autoScrollLoad();
        await applyAllChanges();
        console.log('DeepSeek 脚本已启动，Ctrl+Z 切换隐藏元素');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => init());
    } else {
        init();
    }

    window.deepseekHider = {
        toggle: toggleElements,
        applyStyles: modifyStyles,
        getState: () => ({ isHidden: config.isHidden })
    };
})();