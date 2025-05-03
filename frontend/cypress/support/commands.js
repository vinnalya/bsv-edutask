// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// This is a parent command; logs in the user via UI.
Cypress.Commands.add('loginWithEmail', (email, fullName) => {
    cy.contains('div', 'Email Address')
      .find('input[type=text]')
      .type(email);
    cy.get('form').submit();
    cy.get('h1').should('contain.text', 'Your tasks, ' + fullName);
  });




  // This is a parent command; Creates a new task with given title and video key.
  Cypress.Commands.add('createNewTask', (title, url) => {
    cy.get('input#title').type(title);
    cy.get('input#url').type(url);
    cy.get('input[type=submit]').click();
    cy.contains('.title-overlay', title).should('exist');
  });






  // This is a parent command; Adds a new item to do list.
  Cypress.Commands.add('addTodo', (description) => {
    cy.get('.popup-inner form.inline-form input[type=text]')
      .type(description, { force: true });
    cy.get('.popup-inner form.inline-form input[type=submit]')
      .click({ force: true });
    cy.contains('.todo-item', description).should('exist');
  });





  // This is a parent command: Attemps to add an empty item and checks it is not submitted.
  Cypress.Commands.add('attemptEmptyTodo', () => {
    cy.get('.popup-inner form.inline-form input[type=text]')
      .clear({ force: true })
      .should('have.value', '');
    cy.get('.popup-inner form.inline-form input[type=submit]')
      .click({ force: true });
  });




// This is a child command; for the check done/undone status
Cypress.Commands.add('toggleTodoStatus', (todoText) => {
    cy.contains('.todo-item', todoText)
      .find('.checker')
      .click({ force: true });
  });


//  This is a child command which deletes item from the list
Cypress.Commands.add('deleteTodo', (todoText) =>{
    cy.contains('.todo-item', todoText)
    .find('.remover')
    .click({force: true});
});