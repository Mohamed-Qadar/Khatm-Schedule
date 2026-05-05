import type { AppScreen } from '../types'

interface HomeScreenProps {
  onSelect: (screen: AppScreen) => void
}

export function HomeScreen({ onSelect }: HomeScreenProps) {
  return (
    <main className="app-shell home-shell">
      <section className="hero-panel">
        <span className="eyebrow">HATİM ÇİZELGESİ VE OKUMA PROGRAMI SİSTEMİ</span>
        <h1>Pratik, düzenli ve yazdırmaya hazır çizelgeler oluşturun.</h1>
        <p>
          Hatim planı ve okuma programı için düzenlenebilir tablolar hazırlayın,
          A4 uyumlu PDF alın ve çoklu çıktıları tek seferde indirin.
        </p>
      </section>

      <section className="selection-grid" aria-label="Modül seçimi">
        <button className="module-card" onClick={() => onSelect('hatim')}>
          <span className="module-card__tag">Modül 1</span>
          <strong>Hatim Çizelgesi</strong>
          <span>30 cüz için otomatik tarih hesaplayan ve PDF üreten düzen.</span>
        </button>

        <button className="module-card" onClick={() => onSelect('okuma')}>
          <span className="module-card__tag">Modül 2</span>
          <strong>Okuma Programı</strong>
          <span>Vize, Final ve Bütünleme için düzenlenebilir şehir tabloları.</span>
        </button>
      </section>
    </main>
  )
}
