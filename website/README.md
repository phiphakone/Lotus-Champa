# Website Lotus & Champa

File gốc: `lotus-champa-2.html` (SPA ~4.3MB, ảnh nhúng base64, Swiper hero, giỏ hàng localStorage, i18n).

Vì dung lượng lớn hơn giới hạn API GitHub Contents, hãy đẩy file HTML từ máy bạn:

```bash
git clone https://github.com/phiphakone/Lotus-Champa.git
cd Lotus-Champa
mkdir -p website images proposals
cp /đường-dẫn/lotus-champa-2.html website/index.html
cp /đường-dẫn/logo.jpg images/
cp /đường-dẫn/*.docx proposals/
git add .
git commit -m "Add website, images and proposal documents"
git push origin main
```

Sau đó bật GitHub Pages: Settings → Pages → Deploy from branch `main` / folder `/website`.
