// 타임라인과 무관하게 계속 도는 "배경 장식" (피아노 방의 떠다니는 음표).
// 메인 타임라인 안에는 무한 반복을 넣을 수 없어서 별도로 시작합니다. 가벼운 투명도/이동만 사용.
import gsap from 'gsap';

export function startAmbient(refs) {
  refs.notes.forEach((el, i) => {
    if (!el) return;
    const sway = i % 2 === 0 ? 24 : -24;
    gsap
      .timeline({ repeat: -1, delay: i * 0.7 })
      .fromTo(el, { y: 30, x: 0, autoAlpha: 0 }, { y: -140, x: sway, autoAlpha: 0.85, duration: 2.0, ease: 'sine.out' })
      .to(el, { y: -260, x: 0, autoAlpha: 0, duration: 1.6, ease: 'sine.in' });
  });
}
