import Image from "next/image"
import { Reveal } from "@/components/reveal"
import { Heart, Flower2, Gem } from "lucide-react"

const values = [
  {
    icon: Heart,
    title: "Dibuat dengan Hati",
    body: "Setiap detail dirangkai dengan perhatian dan makna — mewakili cinta yang tulus.",
  },
  {
    icon: Flower2,
    title: "Estetika Natural",
    body: "Perpaduan bunga segar, tekstur premium, dan palet warna yang tenang dan anggun.",
  },
  {
    icon: Gem,
    title: "Material Premium",
    body: "Kami memilih bahan terbaik — dari kotak akrilik hingga sutra — tanpa kompromi.",
  },
]

export function Story() {
  return (
    <section id="story" className="relative bg-background py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="grid grid-cols-1 items-center gap-14 md:grid-cols-2">
          <Reveal className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] shadow-xl">
              <Image
                src="/story-hands.jpg"
                alt="Tangan sedang merangkai seserahan pernikahan mewah"
                fill
                sizes="(min-width: 768px) 45vw, 100vw"
                loading="lazy"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 hidden rounded-2xl bg-secondary px-6 py-5 shadow-lg md:block">
              <div className="font-serif text-2xl text-foreground">Est. 2018</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                Jakarta · Indonesia
              </div>
            </div>
          </Reveal>

          <div>
            <Reveal>
              <div className="flex items-center gap-3 divider-ornament">
                <span className="text-xs uppercase tracking-[0.25em] text-primary">
                  Our Story
                </span>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <h2 className="mt-5 font-serif text-4xl leading-tight text-foreground text-balance md:text-5xl">
                Mahar & seserahan,
                <span className="block italic text-gold-gradient">lebih dari sekadar tradisi.</span>
              </h2>
            </Reveal>

            <Reveal delay={200}>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground text-pretty">
                Di balik setiap mahar, ada janji. Di balik setiap seserahan, ada harapan.
                daztore.id percaya bahwa tradisi yang indah layak dirayakan dengan presentasi
                yang sepadan — penuh ketelitian, keanggunan, dan kehangatan.
              </p>
            </Reveal>

            <Reveal delay={300}>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">
                Kami mendampingi Anda dari konsep awal hingga hari H — memastikan setiap
                elemen mencerminkan kisah cinta Anda berdua.
              </p>
            </Reveal>

            <div className="mt-10 grid gap-5 sm:grid-cols-3">
              {values.map((v, i) => (
                <Reveal key={v.title} delay={400 + i * 100}>
                  <div className="group h-full rounded-2xl border border-border/70 bg-card/70 p-5 transition-all duration-500 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors duration-500 group-hover:bg-primary group-hover:text-primary-foreground">
                      <v.icon className="h-5 w-5" />
                    </div>
                    <div className="mt-4 font-serif text-base text-foreground">{v.title}</div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {v.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
