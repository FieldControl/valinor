export const scrollTop = (): void =>{
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'  
    });
};