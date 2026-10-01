import Link from 'next/link';
import { ScrollAnimate } from '@/components/ScrollAnimate';

export const metadata = {
  title: 'Our Story — Dev Creation',
};

const STORY_BLOCKS = [
  {
    eyebrow: 'The beginning',
    title: 'Where it all started',
    img: '/assets/elegant-display-lit-candles-with-golden-holders-marble-table-featuring-decorative-plant_93675-335471.avif',
    paras: [
      'We started because the air fresheners and wax products we found all smelled artificial and mass-produced. Nothing felt personal or luxurious.',
      'So we decided to create our own — handmade wax sachets and melts crafted with pure soy wax and premium fragrance oils, designed to bring real elegance to everyday spaces.',
    ],
  },
  {
    eyebrow: 'Our craft',
    title: 'Made with love',
    img: '/assets/Gifting/1.jpeg',
    paras: [
      'Every product is handmade in small batches. We use 100% pure soy wax — paraffin-free, unbleached, and safe for your clothes, wardrobes, and living spaces.',
      'Our fragrance oils are IFRA-certified and carefully layered to feel rich, natural, and long-lasting. Never overpowering, always inviting.',
    ],
  },
  {
    eyebrow: 'The experience',
    title: 'Designed to delight',
    img: '/assets/Gifting/2.jpeg',
    paras: [
      'From wardrobes to car dashboards, from bathrooms to gifting — our wax sachets are designed to fit seamlessly into your life and elevate every space.',
      'Every piece is thoughtfully packaged and beautiful enough to gift. Because we believe fragrance is one of the most personal presents you can give.',
    ],
  },
];

const VALUES = [
  { icon: '✦', title: '100% Handmade', body: 'Every product is crafted by hand with meticulous attention, one small batch at a time.' },
  { icon: '❋', title: 'Long Lasting Fragrance', body: 'Premium fragrance oils designed to fill your spaces gently for weeks.' },
  { icon: '◈', title: 'Premium Quality', body: 'Pure soy wax and IFRA-compliant fragrance oils — nothing less.' },
  { icon: '❖', title: 'Perfect for Gifting', body: 'Elegantly designed and beautifully packaged for every occasion.' },
];

export default function OurStoryPage() {
  return (
    <>
      <section className="px-[var(--pad)] pb-[clamp(40px,6vh,72px)] pt-[clamp(60px,10vh,120px)] text-center">
        <ScrollAnimate>
          <h1 className="mb-5 font-display-alt text-[clamp(2.4rem,5.5vw,4.2rem)] font-medium leading-tight text-ink">Our Story</h1>
        </ScrollAnimate>
        <ScrollAnimate delay={100}>
          <p className="mx-auto max-w-[54ch] text-[1.08rem] font-light leading-8 text-body">
            Each Dev Creation product is a labour of love — handcrafted with care, scented with the finest fragrance
            oils, and designed to transform every space it touches.
          </p>
        </ScrollAnimate>
      </section>

      <div className="mx-auto h-[1.5px] w-[60px] bg-gold-lt" />

      {STORY_BLOCKS.map((block, i) => {
        const reversed = i % 2 === 1;
        return (
          <div
            key={block.title}
            className="grid grid-cols-1 items-center gap-[clamp(32px,5vw,72px)] px-[var(--pad)] py-[clamp(40px,6vh,80px)] min-[861px]:grid-cols-2"
          >
            <ScrollAnimate
              direction={reversed ? 'right' : 'left'}
              className={reversed ? 'min-[861px]:order-2' : ''}
            >
              <div className="max-h-[360px] overflow-hidden rounded-[10px] shadow-[0_24px_56px_-18px_rgba(28,20,16,.16)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={block.img} alt={block.title} className="h-full max-h-[360px] w-full object-cover" />
              </div>
            </ScrollAnimate>
            <ScrollAnimate
              direction={reversed ? 'left' : 'right'}
              className={reversed ? 'min-[861px]:order-1' : ''}
            >
              <div className="max-w-[48ch]">
                <span className="util-label mb-3.5 block">{block.eyebrow}</span>
                <h2 className="mb-[18px] font-display-alt text-[clamp(1.6rem,3vw,2.4rem)] font-medium leading-tight text-ink">
                  {block.title}
                </h2>
                {block.paras.map((p) => (
                  <p key={p} className="mb-3.5 text-base leading-[1.82] last:mb-0">
                    {p}
                  </p>
                ))}
              </div>
            </ScrollAnimate>
          </div>
        );
      })}

      <div className="mx-auto h-[1.5px] w-[60px] bg-gold-lt" />

      <section className="border-y border-line bg-surface-2 px-[var(--pad)] py-[clamp(56px,8vh,100px)] text-center">
        <ScrollAnimate>
          <h2 className="mb-12 font-display-alt text-[clamp(1.8rem,3.4vw,2.8rem)] font-medium text-ink">What we stand for</h2>
        </ScrollAnimate>
        <div className="mx-auto grid max-w-[960px] grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-9 text-center">
          {VALUES.map((value, i) => (
            <ScrollAnimate key={value.title} delay={(i + 1) * 100}>
              <div className="px-5 py-7">
                <span className="mb-4 block text-[2rem] text-gold">{value.icon}</span>
                <h3 className="mb-2.5 font-display text-[1.14rem] font-medium text-ink">{value.title}</h3>
                <p className="text-[0.9rem] leading-relaxed">{value.body}</p>
              </div>
            </ScrollAnimate>
          ))}
        </div>
      </section>

      <section className="px-[var(--pad)] py-[clamp(56px,8vh,100px)] text-center">
        <ScrollAnimate>
          <h2 className="mb-4 font-display-alt text-[clamp(1.8rem,3.6vw,3rem)] font-medium text-ink">Ready to find your fragrance?</h2>
        </ScrollAnimate>
        <ScrollAnimate delay={100}>
          <p className="mx-auto mb-[30px] max-w-[44ch] text-[1.02rem] font-light leading-8">
            Explore our handcrafted collection of luxury wax sachets, melts, and aroma stones.
          </p>
        </ScrollAnimate>
        <ScrollAnimate delay={200}>
          <Link href="/products" className="btn-primary">
            Shop the collection
          </Link>
        </ScrollAnimate>
      </section>
    </>
  );
}
