import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import Grainient from "./components/animations/Grainient";

export default function Home() {
  return (
    <div>
      <div className="relative overflow-hidden bg-accent text-white">
        {/* Safe visual background elements: abstract glows and soft shapes */}
        <div className="absolute inset-0 z-0">
          <Grainient
            color1="#6fa0ff"
            color2="#000000"
            color3="#0241ff"
            timeSpeed={0.25}
            colorBalance={0}
            warpStrength={1}
            warpFrequency={5}
            warpSpeed={2}
            warpAmplitude={50}
            blendAngle={0}
            blendSoftness={0.8}
            rotationAmount={500}
            noiseScale={2}
            grainAmount={0.1}
            grainScale={2}
            grainAnimated={false}
            contrast={2.5}
            gamma={1}
            saturation={1}
            centerX={0}
            centerY={0}
            zoom={0.9}
          />
        </div>

        <div className="relative z-10">
          <Navbar />
          <Hero />
        </div>
      </div>
      <Footer />
    </div>
  );
}
