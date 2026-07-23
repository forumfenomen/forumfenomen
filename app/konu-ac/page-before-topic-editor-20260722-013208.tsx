import Link from "next/link";

export default function CreateTopicPage() {
  return (
    <main className="ff-placeholder-page">
      <section>
        <span>ForumFenomen</span>
        <h1>Yeni Konu Aç</h1>
        <p>Konu oluşturma ekranını bir sonraki adımda hazırlayacağız.</p>
        <Link href="/akis">Ana akışa dön</Link>
      </section>
    </main>
  );
}
