//conjunto de atributos e métodos
//variáveis = atributos
//funções = métodos

class CalcController { 
    
    constructor(){
        //atributos e métodos       //Por convenção, o underline é usado para tornar o atributo privado (só deveria ser usado na própria classe)

        //elementos HTML
        this._$displayCalc = document.querySelector('#display')
        this._$date = document.querySelector('#data')
        this._$time = document.querySelector('#hora')

        
        //para fins de data/hora
        this._currentDate           //var currentDate    
        this._locale = 'pt-BR'      //localização

        //para fins de calculo  
        this._lastOperator = ''     //último operador   
        this._lastNumber = ''       //último resultado obtido     
        this._operation = []        //guardar operação aritmética

        //para fins de audio
        this._audioOnOFf = false
        this._audio = new Audio('click.mp3') //carrega a API do audio

        this.initialize()           //function initialize
        this.initButtonsEvents()    //adicionar eventos aos botões
        this.initKeyboard()         //adicionar eventos com teclado
    }

    //função para colar valor no display
    pasteFromClipboard() {       
        document.addEventListener('paste', e => {
            let text = e.clipboardData.getData('Text')
            this.displayCalc = parseFloat(text)
        })
    }
    
    //função para copiar valor do display
    copyToClipboard() {
        let $input = document.createElement('input')        
        $input.value = this.displayCalc        
        document.body.appendChild($input) //cria um input no body        
        $input.select() //selecionar o conteúdo do input        
        document.execCommand('Copy') //copiar        
        $input.remove()   //exclui o input do body
    }
        
    initialize(){ //tudo que é para executar ao iniciar    
        
       this.setDisplayDateTime()

        setInterval(()=>{ //para atualizar a cada segundo

           this.setDisplayDateTime()

        }, 1000)

        this.setLastNumberToDisplay()
        this.pasteFromClipboard()

        //adicionando evento de duplo click no(s) botão(ões) AC
        document.querySelectorAll('.btn-ac').forEach(btn => {
            btn.addEventListener('dblclick', e => {
                this.toogleAudio()
            })
        })
    }

    toogleAudio(){ //se for false, muda para true e vice-versa
        this._audioOnOFf = !this._audioOnOFf

        // this._audioOnOFf = (this._audioOnOFf) ? false : true
    /*
        if (this._audioOnOFf){
            this._audioOnOFf = false
        } else {
            this._audioOnOFf = true
        }
    */
    }

    playAudio(){
        if (this._audioOnOFf) { //se o audio for true
            this._audio.currentTime = 0  //põe o audio do início
            this._audio.play()  //toca o audio
        }
    }

    initKeyboard(){ //função para adicionar eventos no teclado       
        document.addEventListener('keyup', e => {
            this.playAudio() //toca o audio
            switch (e.key) { //para cada key pressionada

                case 'Escape':
                    this.clearAll()
                    break;
    
                case 'Backspace':
                    this.clearEntry()
                    break;
    
                case '+':
                case '-':
                case '*':
                case '/':
                case '%':      
                    this.addOperation(e.key)                
                    break;
    
                case 'Enter':
                case '=':
                    this.calc()
                    break
    
                case '.':
                case ',':
                    this.addDot()
                    break
    
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(parseInt(e.key))
                    break 
                case 'c':
                    if (e.ctrlKey) this.copyToClipboard() //se tiver ctrl pressionado
                    break        
            }
        })
    }

    //MÉTODOS CRIADOS (FUNÇÕES)

    //método para criar eventos e funções em alvos (elementos)
    addEventListenerAll(element, events,  fn) { //element = btn / events = 'click drag' /
        events.split(' ').forEach(event => { //'click drag' => ['click','drag'] (e qualquer outro evento)
            element.addEventListener(event, fn, false) //btn.AddEventListener('click', event) //false para não duplicar
        })                                              //btn.AddEventListener('drag', event)
    }

    clearAll(){     //função do botão AC
        this._operation = [] //zerar array (operação)
        this._lastNumber = ''
        this._lastOperator = ''
        this.setLastNumberToDisplay() //atualiza display
    }

    clearEntry(){   //função do botão CE
        this._operation.pop()   //retira último item do array (operação)
        this.setLastNumberToDisplay() //atualiza display
    }

    getLastOperation(){ //função para pegar a última posição do array (operação)
       return this._operation[this._operation.length - 1]
    }

    //substitui o último dígito pelo novo
    setLastOperation(newValue){
        this._operation[this._operation.length - 1] = newValue
    }

    isOperator(value){ //função para verificar se é operador
        if (['+', '-', '*', '/', '%'].indexOf(value) > -1) {
            return true
        } else {
            return false
        }
    }

    //insere o valor no final do array
    pushOperation(value) {
        this._operation.push(value)
        
        if (this._operation.length > 3){ //se o valor for o quarto do array            
            this.calc()
        }

    }

    //calcula o resultado
    getResult(){
        try { //se for possível
            return eval(this._operation.join('')) //calcula o resultado contido no array (join separa os valores por 'nada', pois o array está separado por vírgulas)
        } catch(e){ //se não for
            setTimeout(() => {
                this.setError() //retorna função de erro
            }, 1)               //após 1ms
        }
    }

    //realiza a operação contida no array
    calc(){
        let lastValue = ''

        this._lastOperator = this.getLastItem()     //guarda o último operador encontrado //getLastItem(true)

        if (this._operation.length < 3) {
            let firstItem = this._operation[0] //resultado guardado
            this._operation = [firstItem, this._lastOperator, this._lastNumber] //resultado guardado, último operador, último número
        }

        if (this._operation.length > 3) {           //ex: 2 + 3 +      
            lastValue = this._operation.pop()       //remove o quarto valor do array
            this._lastNumber = this.getResult()     //guarda o último número (resultado) ex: 5
            
        } else if (this._operation.length == 3) {       //ex: 2 + 3 = 
            this._lastNumber = this.getLastItem(false)  //guarda o último número (último número mesmo) //ex: 3
        }

        let result = this.getResult()
        
        if (lastValue == '%'){      //se for %
            result /=  100          //realiza operação (ele mesmo dividido por 100)
            this._operation = [result]  //adiciona o resultado obtido e insere no array

        } else {
            this._operation = [result]   //adiciona o resultado obtido, insere no array 
            
            if (lastValue) this._operation.push(lastValue) //se o lastValue não for vazio, adiciona o que seria o quarto valor
        }
        this.setLastNumberToDisplay()               //atualiza o display
        
    }

    getLastItem(isOperator = true){ //por padrão = operador
        let lastItem
        
        for (let i = this._operation.length - 1; i >= 0; i--){ //percorre o array em busca do último item
            
            if (this.isOperator(this._operation[i]) == isOperator){ //se for um operador
                lastItem = this._operation[i]                //grava o último item do array
                break
            }
            /*
            if (isOperator) { //se for um operador
            
                if (this.isOperator(this._operation[i])){         //se for um operador
                    lastItem = this._operation[i]                //grava o último item do array
                    break                                          //pára a execução do for
                }
            } else {
                if (!this.isOperator(this._operation[i])){         //se não for um operador (se for um número)
                    lastItem = this._operation[i]                //grava o último número
                    break                                          //pára a execução do for
                }
            }
            */
        }
        if (!lastItem) {   //se percorrer o for e não achar operador (undefined)
            lastItem = (isOperator) ? this._lastOperator : this._lastNumber //se não encontrar o operador (undefined), mantém o último operador. else
        }

        return lastItem                                     //retorna o último item do array (operador ou número)

    }

    setLastNumberToDisplay(){   //atualiza o display mostrando o último número do array
        let lastNumber = this.getLastItem(false) 
        
        if (!lastNumber) lastNumber = 0 //se for vazio (undefined) (no caso do método clearAll), será 0

        this.displayCalc = lastNumber   //mostra o último número do array no display
    }    

    addOperation(value){
        if (isNaN(this.getLastOperation())){     //se o último dígito não for numérico
            if (this.isOperator(value)){    //se for um operador
                this.setLastOperation(value) //substitui o operador antigo pelo novo
             
            } else {
                this.pushOperation(value)

                this.setLastNumberToDisplay()
            }

        } else { //é numérico
            if (this.isOperator(value)){
                this.pushOperation(value)

            } else {
                let newValue = this.getLastOperation().toString() + value.toString() //concatenar o último número com o valor inserido
                this.setLastOperation(newValue) //adiciona o novo valor ao array (operação), substituindo o anterior

                this.setLastNumberToDisplay()           
            }

        }        
        
    }

    setError(){     //função de erro
        this.displayCalc = 'Error'
    }

    addDot(){
        let lastOperation = this.getLastOperation()

        if (typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > - 1) return //se for strin e tiver ponto, ignorar o resto retornando

        if (this.isOperator(lastOperation) || !lastOperation){ //se a última casa for operador ou undefined
            this.pushOperation('0.')
        } else { //se for um número
            this.setLastOperation(lastOperation.toString() + '.') //adiciona o valor e acrescenta um ponto
        }
        this.setLastNumberToDisplay()
    }

    execBtn(btnValue) {
        this.playAudio() //tocar audio

        switch (btnValue) {
            case 'ac':
                this.clearAll()
                break;

            case 'ce':
                this.clearEntry()
                break;

            case 'soma':
                this.addOperation('+')                
                break;

            case 'subtracao':
                this.addOperation('-')
                break;

            case 'divisao':
                this.addOperation('/')
                break;

            case 'multiplicacao':
                this.addOperation('*')
                break;

            case 'porcento':
                this.addOperation('%')
                break

            case 'igual':
                this.calc()
                break

            case 'ponto':
                this.addDot()
                break

            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(btnValue))
                break            
                  
            default:
                this.setError()
                break
        }
    }

    //método para inserir eventos aos botões    
    initButtonsEvents(){
        let $buttons = document.querySelectorAll('#buttons > g, #parts > g') //tag g filhas de buttons e parts (todas)

        $buttons.forEach((btn, index) => {              //para cada botão
            this.addEventListenerAll(btn, 'click drag', event => {    //aplicar evento click e drag
                let textBtn = btn.className.baseVal.replace('btn-', '') //valor do btn (tirando btn-)
                this.execBtn(textBtn)
                
            })
            this.addEventListenerAll(btn, 'mouseover mouseup mousedown', event => { //adicionando eventos de mouse distintos
                btn.style.cursor = 'pointer' //para alterar o estilo de cursor
            })            
        })
    }

    setDisplayDateTime() {  //muda o valor exibido na tela da data e hora
        this.displayDate = this.currentDate.toLocaleDateString(this._locale,{
            day: '2-digit',     //dia com 2 dígitos
            month: 'long',      //mês por extenso
            year: 'numeric'     //ano extenso
        }) //date = data
        this.displayTime = this.currentDate.toLocaleTimeString(this._locale) //time = hora
    }

    get displayCalc(){      //busca e devolve o valor do atributo
        return this._$displayCalc.innerHTML
    }

    set displayCalc(value){     //muda o valor do atributo para o parâmetro passado
        if (value.toString().length > 10){ //se houver mais de 10 dígitos
            this.setError()     //chama a função de erro
            return false
        }

        this._$displayCalc.innerHTML = value
    }

    get currentDate(){      //retorna a data atual
        return new Date()
    }

    set currentDate(value){
        this._dataAtual = value
    }

    get displayTime(){      //retorna a hora exibida no display
        return this._$time.innerHTML
    }

    set displayTime(value){     //muda o valor da hora
        this._$time.innerHTML = value
    }
    
    get displayDate(){      //retorna a data exibida no display
        return this._$date.innerHTML
    }

    set displayDate(value){     //muda o valor da hora
        this._$date.innerHTML = value
    }
}