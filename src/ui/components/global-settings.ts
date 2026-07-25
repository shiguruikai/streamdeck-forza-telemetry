import { DEFAULT_GLOBAL_SETTINGS } from '../../shared';

/**
 * グローバル設定 Web コンポーネント
 * <global-settings></global-settings>
 */
class GlobalSettings extends HTMLElement {
  connectedCallback(): void {
    this.render();
    this.setupResetButtons();
    this.fixSdpiSelectOptions();
  }

  private render(): void {
    this.innerHTML = String.raw`
<style>
.rpm-row {
  display: flex;
  align-items: center;
  gap: 4px;

  sdpi-textfield {
    width: 80px;
  }

  sdpi-color {
    width: 100%;
  }
}
</style>

<sdpi-item label="IP Address">
  <sdpi-textfield
    setting="address"
    pattern="^(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])){3}$"
    required
    global
  ></sdpi-textfield>
</sdpi-item>

<sdpi-item label="Port">
  <sdpi-textfield
    setting="port"
    pattern="^([1-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$"
    required
    global
  ></sdpi-textfield>
</sdpi-item>

<sdpi-item label="Font">
  <sdpi-select
    setting="font"
    datasource="getFonts"
    loading="Fetching fonts..."
    hot-reload
    show-refresh
    global
  >
  </sdpi-select>
</sdpi-item>

<sdpi-item label="Frame Rate (FPS)">
  <sdpi-select setting="fps" default="${DEFAULT_GLOBAL_SETTINGS.fps}" global>
    <option value="10">10 FPS</option>
    <option value="15">15 FPS</option>
    <option value="20">20 FPS</option>
    <option value="25">25 FPS</option>
    <option value="30">30 FPS</option>
  </sdpi-select>
</sdpi-item>

<sdpi-item label="RPM Normal Zone">
  <div class="rpm-row">
    <sdpi-color setting="rpmNormalColor" default="${DEFAULT_GLOBAL_SETTINGS.rpmNormalColor}" global></sdpi-color>
    <sdpi-button id="reset-rpm-normal">Reset</sdpi-button>
  </div>
</sdpi-item>

<sdpi-item label="RPM Warning Zone">
  <div class="rpm-row">
    <sdpi-textfield setting="rpmWarnPct" pattern="^(100|[1-9]?[0-9])$" required global></sdpi-textfield>
    <span>%</span>
    <sdpi-color setting="rpmWarnColor" default="${DEFAULT_GLOBAL_SETTINGS.rpmWarnColor}" global></sdpi-color>
    <sdpi-button id="reset-rpm-warn">Reset</sdpi-button>
  </div>
</sdpi-item>

<sdpi-item label="RPM Rev Zone">
  <div class="rpm-row">
    <sdpi-textfield setting="rpmRevPct" pattern="^(100|[1-9]?[0-9])$" required global></sdpi-textfield>
    <span>%</span>
    <sdpi-color setting="rpmRevColor" default="${DEFAULT_GLOBAL_SETTINGS.rpmRevColor}" global></sdpi-color>
    <sdpi-button id="reset-rpm-rev">Reset</sdpi-button>
  </div>
</sdpi-item>
`;
  }

  /**
   * リセットボタン押下時：
   * DOM 要素の値を更新し 'change' イベントを発火させます。
   * これにより sdpi-components 内部のバリデーション（pattern チェック等）が実行され、
   * 入力エラー枠の解消、UI表示の即時反映、Stream Deck への保存がすべて連動します。
   */
  private setupResetButtons(): void {
    this.querySelector('#reset-rpm-normal')?.addEventListener('click', () => {
      this.resetSettings({ rpmNormalColor: DEFAULT_GLOBAL_SETTINGS.rpmNormalColor });
    });

    this.querySelector('#reset-rpm-warn')?.addEventListener('click', () => {
      this.resetSettings({
        rpmWarnPct: DEFAULT_GLOBAL_SETTINGS.rpmWarnPct,
        rpmWarnColor: DEFAULT_GLOBAL_SETTINGS.rpmWarnColor,
      });
    });

    this.querySelector('#reset-rpm-rev')?.addEventListener('click', () => {
      this.resetSettings({
        rpmRevPct: DEFAULT_GLOBAL_SETTINGS.rpmRevPct,
        rpmRevColor: DEFAULT_GLOBAL_SETTINGS.rpmRevColor,
      });
    });
  }

  private resetSettings(settingsMap: Record<string, string | number>): void {
    Object.entries(settingsMap).forEach(([settingKey, defaultValue]) => {
      const el = this.querySelector<HTMLElement & { value: unknown }>(`[setting="${settingKey}"]`);
      if (!el) return;

      const valStr = String(defaultValue);

      // 1. Web Component の value プロパティを更新（Stream Deck への自動保存をトリガー）
      el.value = defaultValue;

      // 2. Shadow DOM 内の実際の <input> 要素の値を更新し、UI 表示を同期させる
      const innerInput = el.shadowRoot?.querySelector<HTMLInputElement>('input');
      if (innerInput) {
        innerInput.value = valStr;
        innerInput.dispatchEvent(new Event('input', { bubbles: true }));
        innerInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  }

  /**
   * innerHTML による動的挿入時、sdpi-components.js 内部の MutationObserver が <option> の追加を
   * 初期パースのタイミングで正しく検知できずセレクトボックスが空になるのを防ぐため、
   * DOM アタッチ後に直下の子要素を再アタッチして MutationObserver に認識させます。
   */
  private fixSdpiSelectOptions(): void {
    setTimeout(() => {
      this.querySelectorAll('sdpi-select').forEach((select) => {
        Array.from(select.children).forEach((child) => {
          select.appendChild(child);
        });
      });
    }, 0);
  }
}

// Custom Element 登録
customElements.define('global-settings', GlobalSettings);
