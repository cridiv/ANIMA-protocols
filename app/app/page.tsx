import PixelBlast from "./components/animations/PixelBlast";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <div>
      <div className="relative overflow-hidden bg-[#a3c2ff71]">
        <div className="absolute inset-0 z-0">
          <PixelBlast
            variant="square"
            pixelSize={3}
            color="#0241ff"
            patternScale={2}
            patternDensity={1}
            pixelSizeJitter={0.7}
            enableRipples
            rippleSpeed={0.4}
            rippleThickness={0.12}
            rippleIntensityScale={1.5}
            liquid={false}
            liquidStrength={0.12}
            liquidRadius={1.2}
            liquidWobbleSpeed={5}
            speed={0.5}
            edgeFade={0.11}
            transparent
          />
        </div>

        <div className="relative z-0">
          <Navbar />
          <Hero />
        </div>
      </div>
    </div>
  );
}
