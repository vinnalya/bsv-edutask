describe('R8UC2 – Toggle To-Do Item', () => {
    // define variables reused across tests
    const taskTitle = 'Toggle Task';
    const youtubeKey = 'dQw4w9WgXcQ';
    const todoText = 'Complete this item';
  
    let uid;
    let email;
    let name;


    before(() => {
      cy.fixture('user.json').then((user) => {
        email = user.email;
        name = `${user.firstName} ${user.lastName}`;
  
        return cy.request({
          method: 'POST',
          url: 'http://localhost:5000/users/create',
          form: true,
          body: user
        }).then((res) => {
          uid = res.body._id.$oid;
        });
      });
    });
  
    beforeEach(() => {

      cy.visit('http://localhost:3000');
    });
  



    it('2.1 – toggles a todo item from active to done (strikethrough)', () => {

      cy.loginWithEmail(email, name);

  
      // create a new task and open its detail view
      cy.createNewTask(taskTitle, youtubeKey);
      cy.contains('.title-overlay', taskTitle).click();
  
      // add a new todo item to the task
      cy.addTodo(todoText);
  
      // click the toggle icon to mark the item as done
      cy.toggleTodoStatus(todoText);
  
      cy.contains('.todo-item', todoText)
        .find('.checker')
        .should('have.class', 'checked');
    });








    it('2.2 – toggles a todo item back to active (not strikethrough)', () => {

      cy.loginWithEmail(email, name);
      cy.contains('.title-overlay', taskTitle).click();
      
      // click
      cy.toggleTodoStatus(todoText);
  
      // verify the item now has the 'unchecked' class
      cy.contains('.todo-item', todoText)
        .find('.checker')
        .should('have.class', 'unchecked');
    });
  
    
    after(() => {
      // remove the test user from the database
      cy.request('DELETE', `http://localhost:5000/users/${uid}`);
    });
  });
  