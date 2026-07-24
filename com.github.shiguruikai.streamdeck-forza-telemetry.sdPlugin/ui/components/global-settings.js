/**
 * グローバル設定 Web コンポーネント
 * <global-settings></global-settings>
 */
class GlobalSettings extends HTMLElement {
  connectedCallback() {
    this.innerHTML = String.raw`
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
  <sdpi-select setting="fps" default="15" global>
    <option value="10">10 FPS</option>
    <option value="15">15 FPS</option>
    <option value="20">20 FPS</option>
    <option value="25">25 FPS</option>
    <option value="30">30 FPS</option>
  </sdpi-select>
</sdpi-item>
`;

    // innerHTML による動的挿入時、sdpi-components.js 内部の MutationObserver が <option> の追加を
    // 初期パースのタイミングで正しく検知できずセレクトボックスが空になるのを防ぐため、
    // DOM アタッチ後に直下の子要素を再アタッチして MutationObserver に認識させます。
    setTimeout(() => {
      this.querySelectorAll('sdpi-select').forEach((select) => {
        Array.from(select.children).forEach((child) => select.appendChild(child));
      });
    }, 0);
  }
}

// Custom Element 登録
customElements.define('global-settings', GlobalSettings);
