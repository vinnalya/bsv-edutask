describe('R8UC1 – Create a To-Do Item List', () => {
  const taskTitle = 'Test Task';
  const youtubeKey = 'dQw4w9WgXcQ';
  const todoText = 'Buy groceries';

  let uid;
  let email;
  let name;

  // Create test user before all tests
  before(function () {
    cy.fixture('user.json').then((user) => {
      cy.request({
        method: 'POST',
        url: 'http://localhost:5000/users/create',
        form: true,
        body: user
      }).then((res) => {
        uid = res.body._id.$oid;
        name = user.firstName + ' ' + user.lastName;
        email = user.email;
      });
    });
  });





  // Visit app before each test
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('1.1 – allows user to type a description into the input field', () => {
    cy.loginWithEmail(email, name);
    cy.get('input#title')
      .type(taskTitle)
      .should('have.value', taskTitle);
  });






  it('1.2 – creates a new task and adds a new to-do item', () => {
    cy.loginWithEmail(email, name);
    cy.createNewTask(taskTitle, youtubeKey);
    cy.contains('.title-overlay', taskTitle).click();
    cy.addTodo(todoText);
  });






  it('1.2 (Alternative) – does not add todo when input is empty', () => {
    cy.loginWithEmail(email, name);
    cy.createNewTask(taskTitle, youtubeKey);
    cy.contains('.title-overlay', taskTitle).click();

    cy.get('.todo-item').then(items => {
      const initialCount = items.length;

      cy.attemptEmptyTodo();
      cy.wait(500);

      cy.get('.todo-item').should('have.length', initialCount);
    });
  });






  // Delete test user after all tests
  after(() => {
    cy.request('DELETE', `http://localhost:5000/users/${uid}`);
  });
});
