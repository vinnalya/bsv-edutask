/// <reference types="cypress" />
const API = Cypress.env('API');

describe('R8UC1 – Create a To-Do Item List', () => {
  let uid, taskId, user;

  before(() => {
    cy.viewport(1920, 1080);
    cy.apiCreateUser().then(({ uid: newUid, user: newUser }) => {
      uid = newUid;
      user = newUser;
      return cy.apiCreateTask(uid);
    }).then(id => {
      taskId = id;
    });
  });

  beforeEach(() => {
    cy.viewport(1920, 1080);
    cy.intercept('GET', `${API}/tasks/ofuser/**`).as('getTasks');
    cy.intercept('GET', `${API}/tasks/byid/**`).as('getTaskById');
    cy.intercept('POST', `${API}/todos/create`).as('createTodo');

    cy.visit('/');
    cy.contains('div', 'Email Address')
      .find('input[type=text]')
      .type(user.email, { delay: 10, force: true });
    cy.get('form').submit();

    cy.wait('@getTasks');
    cy.contains('a', 'GUI-test task').click();
    cy.wait('@getTaskById');
    cy.get('.popup').should('be.visible');
  });

  // 1 - create a todo with minimum input (1 char)
  it('1 – adds todo with minimum 1-char input', () => {
    const desc = 'A';
    cy.get('[placeholder="Add a new todo item"]').type(desc);
    cy.get('form.inline-form input[type=submit]').click();
    cy.wait('@createTodo');
    cy.wait('@getTaskById');
    cy.contains('li.todo-item', desc).should('be.visible');
  });

  // 2 - create a todo with max 200-char input
  it('2 – adds todo with maximum 200-char input', () => {
    const desc = 'x'.repeat(200);
    cy.get('[placeholder="Add a new todo item"]').type(desc);
    cy.get('form.inline-form input[type=submit]').click();
    cy.wait('@createTodo');
    cy.wait('@getTaskById');
    cy.contains('li.todo-item', desc).should('be.visible');
  });

  //3 - check if Add button is disabled when input is empty
  it('3 – disables Add button when input is empty', () => {
    cy.get('[placeholder="Add a new todo item"]').clear();
    cy.get('form.inline-form input[type=submit]').should('be.disabled');
  });

  after(() => {
    cy.apiDeleteTask(taskId);
    cy.apiDeleteUser(uid);
  });
});
