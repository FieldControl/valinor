import { SVG } from '../../components/SVG';

export function Footer() {
  return (
    <footer className='flex border-b border-t border-border flex-col h-full w-full items-center flex-items-center  text-center pb-2 f6 color-fg-muted border-top color-border-muted flex-column-reverse flex-lg-row flex-wrap flex-lg-nowrap mt-6 pt-6'>
      <a className='inline' id='link-gitHub' href='https://github.com/wenblack' target={'_blank'}>Created with 💗 by Wender</a>
      <SVG height={80} width={80}></SVG>
    </footer>
  );
}