describe('R8UC3 – Delete To-Do Item', () => {
  const taskTitle = 'Delete Task' // title of the task to be created
  const youtubeKey = 'dQw4w9WgXcQ' // sample YouTube video key
  const todoText = 'This will be deleted' // todo text to be deleted



  let uid
  let email
  let name


  
  before(() => {
    // create a fabricated user from a fixture before tests start
    cy.fixture('user.json').then((user) => {
      email = user.email
      name = `${user.firstName} ${user.lastName}`

      // send POST request to create the test user in the system
      return cy.request({
        method: 'POST',
        url: 'http://localhost:5000/users/create',
        form: true,
        body: user
      }).then((res) => {
        uid = res.body._id.$oid
      })
    })
  })

  
  beforeEach(() => {
    cy.visit('http://localhost:3000')
  })

  
  it('3.1 – deletes a todo item from the list', () => {
    cy.loginWithEmail(email, name)

    cy.createNewTask(taskTitle, youtubeKey)
    cy.contains('.title-overlay', taskTitle).click()
    
    cy.addTodo(todoText)

    cy.contains('.todo-item', todoText).should('exist')
    
    cy.deleteTodo(todoText)
    
    // assert that the todo no longer exists
    cy.contains('.todo-item', todoText).should('not.exist')
  })

  
  after(() => {
    // cleans
    cy.request('DELETE', `http://localhost:5000/users/${uid}`)
  })
})
