/// <reference types="cypress" />
const API = Cypress.env('API');

describe('R8UC2 – Toggle To-Do Item', () => {
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
    cy.intercept('PUT', `${API}/todos/byid/**`).as('toggleTodo');

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

  it('1 – toggles todo from active to done (line-through appears)', () => {
    const desc = 'toggle-done';
    cy.apiCreateTodo(taskId, desc).then(todo => {
      const id = todo._id.$oid;
      cy.apiUpdateTodo(id, { $set: { done: false } });
    });

    cy.get('button.close-btn').click();
    cy.contains('a', 'GUI-test task').click();
    cy.wait('@getTaskById');

    cy.contains('li.todo-item', desc)
      .find('span.checker')
      .click({ force: true });
    cy.wait('@toggleTodo');

    cy.contains('li.todo-item', desc)
      .find('span.editable')
      .should('have.css', 'text-decoration-line', 'line-through');
  });

  it('2 – toggles todo from done to active (line-through removed)', () => {
    const desc = 'toggle-undone';
    cy.apiCreateTodo(taskId, desc).then(todo => {
      const id = todo._id.$oid;
      cy.apiUpdateTodo(id, { $set: { done: true } });
    });

    cy.get('button.close-btn').click();
    cy.contains('a', 'GUI-test task').click();
    cy.wait('@getTaskById');

    // Toggle undone
    cy.contains('li.todo-item', desc).find('span.checker').click({ force: true });
    cy.wait('@toggleTodo');

    // For DOM
    cy.contains('li.todo-item', desc).find('span.editable')
      .should(($el) => {
        expect($el.css('text-decoration-line')).to.eq('none');
      });
  });

  after(() => {
    cy.apiDeleteTask(taskId);
    cy.apiDeleteUser(uid);
  });
});
