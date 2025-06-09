/// <reference types="cypress" />
const API = Cypress.env('API');

describe('R8UC3 – Delete To-Do Item', () => {
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
    cy.intercept('DELETE', `${API}/todos/byid/**`).as('deleteTodo');

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

  it('1 – deletes a todo item successfully', () => {
    const desc = 'delete-me';
    cy.apiCreateTodo(taskId, desc).then(() => {
      cy.get('button.close-btn').click();
      cy.contains('a', 'GUI-test task').click();
      cy.wait('@getTaskById');

      cy.contains('li.todo-item', desc).within(() => {
        cy.get('span.remover').click();
      });

      cy.wait('@deleteTodo');
      cy.wait('@getTaskById');
      cy.contains('li.todo-item', desc).should('not.exist');
    });
  });

  after(() => {
    cy.apiDeleteTask(taskId);
    cy.apiDeleteUser(uid);
  });
});
