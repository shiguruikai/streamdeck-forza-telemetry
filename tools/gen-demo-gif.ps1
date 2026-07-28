# デモ用 GIF 生成コマンド例
# 録画動画（input.mp4）から指定範囲をクロップし、10fps・最適化パレットで docs/assets/demo.gif を出力します。

ffmpeg -ss 00:00:04 -t 15 -i input.mp4 -vf "fps=10,crop=468:258:898:261,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 -y docs/assets/demo.gif
