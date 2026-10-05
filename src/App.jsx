import Stars from "./components/Stars";
import Corner from "./components/Corner";
import PdfFlipbookViewer from "./PdfFlipbookViewer";

export default function App() {
  return (
    <>
      <Stars />
      <div className="fog" />

      <main className="stage">
        <header className="title">
          <div className="moon">☾ ✦ ☽</div>
          <h1>Yingyot Somjai</h1>
          <p>My · Portfolio</p>
        </header>

        <section className="frame">
          {["tl", "tr", "bl", "br"].map((pos) => (
            <Corner key={pos} pos={pos} />
          ))}

          <div className="book">
            <PdfFlipbookViewer />
          </div>
        </section>

        <footer>
          <span>✦</span> yingyotice@gmail.com <span>✦</span> 091-871-5351 <span>✦</span>
        </footer>
      </main>
    </>
  );
}