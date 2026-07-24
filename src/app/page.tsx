import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Metrics } from "@/components/Metrics";
import { System } from "@/components/System";
import { Protocol } from "@/components/Protocol";
import { Trust } from "@/components/Trust";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Metrics />
        <System />
        <Protocol />
        <Trust />
      </main>
      <Footer />
    </>
  );
}
