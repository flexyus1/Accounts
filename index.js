//modules externos
const inquirer = require('inquirer')
const chalk = require('chalk')


//modulos internos
const fs = require('fs')

operation()

function operation(){

//inicia uma prompt copm algumas escolhas
//vai criar um prompt, que é chamado assim que o programa é executado, é do tipo lista,e o choices é para escolher uma das alternativas
  inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: 'O que você deseja fazer ?',
    choices: ['Criar Conta','Consultar Saldo','Depositar','Sacar','Sair']
  },//esse .then pega a action que foi escolhida, e exibe como resposta
  ]).then((answer) => {
    //answer(resposta) é dado atraves do action, e ele que vai descidir qual função chamar, dependendo da escolha
    //do usuário    
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

//essa função, serve apenas para exibit uma mensagem de parabens por criar a conta
function createAccount() {
  console.log(chalk.bgGreen.black('Parabéns por escolher o nosso banco'))
  console.log(chalk.green('Defina as opções da sua conta a seguir')) 
}

//essa é a função que realmente vai estruturar a conta
function buildAccount() {

  //os requisitos para estruturar a conta são, o nome e armazenar em accountName
  inquirer.prompt([
    {
      name: 'accountName',
      message: 'Digite um nome para a sua conta'
    }
  ]).then((answer) => {
    //aqui a resposta(answer) vai ser utilizado para criar uma conta, nesse nome
    const accountName = answer['accountName']
    

    console.log(accountName)
    //se não existir nenhuma conta, ele vai criar o repositório accounts
    if(!fs.existsSync('accounts')){
      fs.mkdirSync('accounts')
    }

    //se o repositório accounts existir, ele vai criar uma conta no formato json
    if(fs.existsSync(`accounts/${accountName}.json`)){
      console.log(chalk.bgRed.black('Essa conta já existe, escolha outro nome!'),
      )
      buildAccount()
      return
    }
    //da um valor inicial a conta criada, usando o Nome como parametro, de 0 Reais iniciais
    fs.writeFileSync(`accounts/${accountName}.json`,
     '{"balance": 0}',
      function(err) {console.log(err)})

      console.log(chalk.bgGreen.black('Parabéns, sua conta foi criada'))
      operation()
  }).catch((err) => console.log(err))
}

function deposit(){

  //vai usar o nome da conta como parametro para acessar ela
  inquirer.prompt([
    {
      name:'accountName',
      message:'Qual o nome da sua conta ?'
    }
  ]).then((answer) => {
    const accountName = answer['accountName']
    //se não existir conta com esse nome, ele vai perguntar novamente o nome da conta, ele checa se a conta existe
    //utilizando a função de checagem de conta
    if(!checkAccount(accountName)) {
      return deposit()
    }
    //pergunta a quantidade que vai ser depositado, e chama a função de depositar
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
  //ve se o nome da conta existe no depositorio accounts em formato json, se existir retorna verdadeiro, se não, falso
  if(!fs.existsSync(`accounts/${accountName}.json`)){
  console.log(chalk.bgRed.black('Esta conta não existe'))
  return false
}
return true
  
}

function addAmount( accountName, amount) {
  //pega o nome da conta do usuário chamando essa função
  const accountData = getAccount(accountName)

  //se o usuário não passar um valor valido, ele retorna uma menssagem de erro e retorna para o deposito
  if(!amount) {
    console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde'))
    return deposit()
  }

  //transforma a string em numero, e adiciona ao objeto balance no json somando ao valor ja existente lá
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
  //le o nome da conta do usuario na pagina accounts, flag r, quer dizer que ele vai ler, R de read
  const accountJSON= fs.readFileSync(`accounts/${accountName}.json`, {
    encoding: 'utf8',
    flag: 'r'
  })

  return JSON.parse(accountJSON)
}

function getAccountBalance() {

  //pega o nome da conta
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

    // o valor da conta, vai ser igual ao balance da conta selecionada
    const accountData = getAccount(accountName)

    console.log(chalk.bgBlue.black(`Olá o saldo da sua conta é de R$${accountData.balance}`))

  operation()
  })

  .catch(err => console.log(err))
}

function widthdraw() {

  //pergunta o nome da conta para acessar ela
  inquirer.prompt([
    {
      name:'accountName',
      message:'Qual o nome da sua conta ?'
    }
  ]).then((answer) => {

    const accountName = answer['accountName']
    //se a conta não existir pergunte novamente
    if(!checkAccount(accountName)){
      return widthdraw()
    }

    inquirer.prompt([
      {
        name: 'amount',
        message: 'Quanto você deseja sacar ?'
      }
    ]).then((answer) => {

      //chama uma função para remover o valor da escolhido da conta
      const amount = answer['amount']
      removeAmount(accountName, amount)
    })
    .catch(err => console.log(err))
  })
  .catch(err => console.log(err))

}

function removeAmount(accountName, amount) {
  const accountData = getAccount(accountName)

  //se n tiver dinheiro, retorne uma menssagem de erro
  if(!amount) {
    console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde')
    )
    return widthdraw()
  }

  //se tiver menos dinheiro do que quer sacar, fala q o valor não esta disponivel
  if(accountData.balance < amount) {
    console.log(chalk.bgRed.black('Valor indisponivel'))
    return widthdraw()
  }

  //se tudo estiver correto, subtrai o balance, do valor desejado
  accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)
  //reescreve o novo valor no objeto balance do json
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