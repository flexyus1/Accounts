//modules externos
const inquirer = require('inquirer')
const chalk = require('chalk')


//modulos internos
const fs = require('fs')

operation()

function operation(){

//inicia uma prompt copm algumas escolhas
  inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: 'O que você deseja fazer ?',
    choices: ['Criar Conta','Consultar Saldo','Depositar','Sacar','Sair']
  },//esse .then pega a action que foi escolhida, e exibe como resposta
  ]).then((answer) => {

    const action = answer['action']

   if(action === 'Criar Conta'){
    createAccount()
    buildAccount()
   }else if(action === 'Depositar'){
    deposit()
   }else if(action === 'Consultar Saldo'){
    getAccountBalance()
   }else if(action === 'Sacar'){
    widthdraw()
   }else if(action === 'Sair'){
    console.log(chalk.bgBlue.black('Obrigado por utilizar o programa'))
    process.exit()
   }
  })
  .catch((err) => console.log(err))
}

//criando conta

function createAccount() {
  console.log(chalk.bgGreen.black('Parabéns por escolher o nosso banco'))
  console.log(chalk.green('Defina as opções da sua conta a seguir')) 
}

function buildAccount() {

  inquirer.prompt([
    {
      name: 'accountName',
      message: 'Digite um nome para a sua conta'
    }
  ]).then((answer) => {
    const accountName = answer['accountName']

    console.log(accountName)

    if(!fs.existsSync('accounts')){
      fs.mkdirSync('accounts')
    }

    if(fs.existsSync(`accounts/${accountName}.json`)){
      console.log(chalk.bgRed.black('Essa conta já existe, escolha outro nome!'),
      )
      buildAccount()
      return
    }

    fs.writeFileSync(`accounts/${accountName}.json`,
     '{"balance": 0}',
      function(err) {console.log(err)})

      console.log(chalk.bgGreen.black('Parabéns, sua conta foi criada'))
      operation()
  }).catch((err) => console.log(err))
}

function deposit(){
  inquirer.prompt([
    {
      name:'accountName',
      message:'Qual o nome da sua conta ?'
    }
  ]).then((answer) => {
    const accountName = answer['accountName']

    if(!checkAccount(accountName)) {
      return deposit()
    }

    inquirer.prompt([
      {
        name:'amount',
        message:'Quanto você deseja depositar'
      },
    ]).then((answer) => {

      const amount = answer['amount']

      addAmount(accountName, amount)
      operation()

    })
     .catch(err=>console.log(err))

  })
  .catch(err => console.log(err))
}

function checkAccount(accountName){
  if(!fs.existsSync(`accounts/${accountName}.json`)){
  console.log(chalk.bgRed.black('Esta conta não existe'))
  return false
}
return true
  
}

function addAmount( accountName, amount) {

  const accountData = getAccount(accountName)

  if(!amount) {
    console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde'))
    return deposit()
  }

  //pega o balance la na conta feita em json transforma em numero e adiciona a ela
  accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)
  fs.writeFileSync(`accounts/${accountName}.json`,
  JSON.stringify(accountData),
  function(err){
    console.log(err)
  },
  )

    console.log(chalk.green(`Foi depositado o valor de R$${amount} na sua conta`))
}

function getAccount(accountName) {
  const accountJSON= fs.readFileSync(`accounts/${accountName}.json`, {
    encoding: 'utf8',
    flag: 'r'
  })

  return JSON.parse(accountJSON)
}

function getAccountBalance() {
  inquirer.prompt([
    {
      name:'accountName',
      message:'Qual o nome da sua conta ?'
    }
  ]).then((answer) => {

    const accountName = answer['accountName']

    // verificando se account existe

    if(!checkAccount(accountName)){
      return getAccountBalance()
    }

    const accountData = getAccount(accountName)

    console.log(chalk.bgBlue.black(`Olá o saldo da sua conta é de R$${accountData.balance}`))

  operation()
  })

  .catch(err => console.log(err))
}

function widthdraw() {

  inquirer.prompt([
    {
      name:'accountName',
      message:'Qual o nome da sua conta ?'
    }
  ]).then((answer) => {

    const accountName = answer['accountName']

    if(!checkAccount(accountName)){
      return widthdraw()
    }

    inquirer.prompt([
      {
        name: 'amount',
        message: 'Quanto você deseja sacar ?'
      }
    ]).then((answer) => {

      const amount = answer['amount']
      removeAmount(accountName, amount)
    })
    .catch(err => console.log(err))
  })
  .catch(err => console.log(err))

}

function removeAmount(accountName, amount) {
  const accountData = getAccount(accountName)

  if(!amount) {
    console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde')
    )
    return widthdraw()
  }

  if(accountData.balance < amount) {
    console.log(chalk.bgRed.black('Valor indisponivel'))
    return widthdraw()
  }

  accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
      function(err){
        console.log(err)
      },
      )

  console.log(chalk.green(`Foi realizado um saque de R$${amount} da sua conta`),
  )
  operation()
}