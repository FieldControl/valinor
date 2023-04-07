describe('App', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  /* Barra de ferramentas */
    /* Verifica se o tamanho da imagem não excede a margem e barra de ferramentas */
    it('should size the logo image correctly', () => {
      cy.get('#imgLogo').then(($img) => {
        const imgHeight = $img.height();
        cy.get('mat-toolbar').then(($toolbar) => {
          const toolbarHeight = $toolbar.height();
          expect(imgHeight).to.be.lessThan(toolbarHeight);
        });
        expect($img).to.have.css('margin', '6.66667px');
      });
      cy.viewport('iphone-6');
      cy.get('#imgLogo').then(($img) => {
        const imgHeight = $img.height();
        cy.get('mat-toolbar').then(($toolbar) => {
          const toolbarHeight = $toolbar.height();
          expect(imgHeight).to.be.lessThan(toolbarHeight);
        });
        expect($img).to.have.css('margin', '6.66667px');
      });    
    });

    /* Verifica se o tamanho do logo não excede a margem e barra de ferramentas */
    it('should size the h1 title correctly', () => {
      cy.get('#h1Title').then(($img) => {
        const imgHeight = $img.height();
        cy.get('mat-toolbar').then(($toolbar) => {
          const toolbarHeight = $toolbar.height();
          expect(imgHeight).to.be.lessThan(toolbarHeight);
        });
        expect($img).to.have.css('margin', '0px');
      });
      cy.viewport('iphone-6');
      cy.get('#h1Title').then(($img) => {
        const imgHeight = $img.height();
        cy.get('mat-toolbar').then(($toolbar) => {
          const toolbarHeight = $toolbar.height();
          expect(imgHeight).to.be.lessThan(toolbarHeight);
        });
        expect($img).to.have.css('margin', '0px');
      });    
    });

    /* Verifica se o tamanho da imagem não excede a margem e barra de ferramentas */
    it('should size the button dark mode correctly', () => {
      cy.get('#buttonDarkMode').then(($img) => {
        const imgHeight = $img.height();
        cy.get('mat-toolbar').then(($toolbar) => {
          const toolbarHeight = $toolbar.height();
          expect(imgHeight).to.be.lessThan(toolbarHeight);
        });
        expect($img).to.have.css('margin', '0px');
      });
      cy.viewport('iphone-6');
      cy.get('#buttonDarkMode').then(($img) => {
        const imgHeight = $img.height();
        cy.get('mat-toolbar').then(($toolbar) => {
          const toolbarHeight = $toolbar.height();
          expect(imgHeight).to.be.lessThan(toolbarHeight);
        });
        expect($img).to.have.css('margin', '0px');
      });    
    });

});