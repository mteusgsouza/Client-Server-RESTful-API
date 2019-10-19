class UserController {

    constructor(formIdCreate, formIdUpdate, tableId) {
        this.formEl = document.getElementById(formIdCreate);
        this.formUpdateEl = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);

        this.onSubmit();
        this.onEdit();
        this.selectAll();
    }

    onEdit() {
        //altera o box de formulário para update para edição do objeto selecionado

        document.querySelector("#box-user-update .btn-cancel").addEventListener("click", e => {
            this.showPanelCreate();
        });

        this.formUpdateEl.addEventListener("submit", event => {
            event.preventDefault();
            let btn = this.formUpdateEl.querySelector("[type=submit]");
            btn.disabled = true;

            let values = this.getValues(this.formUpdateEl);

            let index = this.formUpdateEl.dataset.trIndex;

            let tr = this.tableEl.rows[index];

            let userOld = JSON.parse(tr.dataset.user);

            let result = Object.assign({}, userOld, values);

            this.getPhoto(this.formUpdateEl).then(
                (content) => {

                    if (!values.photo) {
                        result._photo = userOld._photo;
                    } else {
                        result._photo = content;
                    }

                    let user = new User();

                    user.loadFromJSON(result);

                    user.save().then(user => {

                        this.getTr(user, tr);

                        this.updtadeCount();

                        this.formUpdateEl.reset();

                        btn.disabled = false;

                        this.showPanelCreate();
                    });

                },
                (e) => {
                    console.error(e);
                }
            );
        });
    }

    onSubmit() {
        // escuta o evento submit e cria o objeto pelo getValues()

        this.formEl.addEventListener("submit", event => {

            event.preventDefault();

            let btn = this.formEl.querySelector("[type=submit]");
            //seleciona o botão que for do tipo submit dentro do formulário
            btn.disabled = true;
            //desabilita o botão ao enviar para evitar repetição de cadastro

            let values = this.getValues(this.formEl);
            //recebe os valores do formulário tratados em getValues dentro da variável values

            if (!values) return false;
            //se o formulário estiver vazio retorna falso

            this.getPhoto(this.formEl).then(
                (content) => {
                    values.photo = content;
                    //atribui a foto recebida ao objeto

                    values.save().then(user => {

                        this.addLine(user);
                        //adiciona a linha à tabela após o envio da foto

                        this.formEl.reset();
                        //limpa o formulário

                        btn.disabled = false;
                        //habilita o botão ao enviar a foto
                    });
                },
                (e) => {
                    console.error(e);
                }
            );

        });
    }

    getPhoto(formEl) {
        //trata o envio de foto
        return new Promise((resolve, reject) => {

            let fileReader = new FileReader();

            let elements = [...formEl.elements].filter(item => {
                if (item.name === 'photo') {
                    return item;
                }
            });
            //filtra os itens que forem 'photo' no array de objeto do formulário e retorna o item  

            let file = elements[0].files[0];
            //seleciona o item 0 do array filtrado

            fileReader.onload = () => {
                //callback da leitura do arquivo

                resolve(fileReader.result);
            };

            fileReader.onerror = (e) => {
                reject(e);
            }

            if (file) {
                fileReader.readAsDataURL(file);
            } else {
                resolve('dist/img/boxed-bg.jpg');
                //imagem padrão caso não envie uma foto
            }
            //trata se ao salvar foi enviado um arquivo ou não 
        })
    }

    getValues(formEl) {
        //cria registro de user no json e retorna o objeto
        let user = {};
        //cria o json user
        let isValid = true;

        [...formEl.elements].forEach((field, index) => {
            //utilizando o spread "..." para prencher todos os itens do array de objetos

            if (['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value) {
                //name email e password, que forem == nome no array field e enviados vazios
                field.parentElement.classList.add('has-error');

                isValid = false;
            }

            if (field.name == "gender") {
                //para cada atributo name que seja "gender"

                if (field.checked) {
                    //atribui o valor quando for marcado
                    user[field.name] = field.value;
                }

            } else if (field.name == "admin") {
                //trata se o checkbox admin for marcado
                user[field.name] = field.checked;

            } else {

                user[field.name] = field.value;
            }

        });

        if (!isValid) {
            return false;
        }

        return new User(
            user.name,
            user.gender,
            user.birth,
            user.country,
            user.email,
            user.password,
            user.photo,
            user.admin
        );
    }

    selectAll() {
        //seleciona todos os users para carregar na tablea de lista de usuários 

        User.getUsersStorage().then(data => {

            data.users.forEach(dataUser => {
                //pra cada usuario adiciona uma linha na tabela
                let user = new User();

                user.loadFromJSON(dataUser);

                this.addLine(user);
            });

        });

    }

    addLine(dataUser) {
        //adiciona o objeto recebido na última posição da lista de usuários, e atualiza a contagem de usuários cadastrados
        let tr = this.getTr(dataUser);

        this.tableEl.appendChild(tr);

        this.updtadeCount();
    }

    getTr(dataUser, tr = null) {
        //recebe os dados do user e formata a exibição na tabela lista de usários

        if (tr === null) tr = document.createElement('tr');
        //cria uma nova tr caso tr seja null, criação de novo user

        tr.dataset.user = JSON.stringify(dataUser);
        //transforma o objeto user em uma string JSON

        tr.innerHTML = `
            <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
            <td>${dataUser.name}</td>
            <td>${dataUser.email}</td>
            <td>${(dataUser.admin) ? 'Sim' : 'Não'}</td>
            <td>${Utils.dateFormat(dataUser.register)}</td>
            <td>
                <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
            </td>
        `;

        this.addEventsTr(tr);
        return tr;
    }

    addEventsTr(tr) {
        //adiciona o evento de delete ao item da tabela
        tr.querySelector(".btn-delete").addEventListener("click", e => {

            if (confirm("Deseja realmente excluir?")) {

                let user = new User();

                user.loadFromJSON(JSON.parse(tr.dataset.user));

                user.remove().then(data => {
                    tr.remove();
                    //comando remove do html
                    this.updtadeCount();
                });

            }

        });

        tr.querySelector(".btn-edit").addEventListener("click", e => {
            let json = JSON.parse(tr.dataset.user);
            //converte a string JSON para objeto user, e seleciona o formulário de update para receber os valores do objeto

            this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex;

            for (let name in json) {
                //name dos campos no json

                let field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "]");
                //remove os _ dos nomes dos campos 
                if (field) {

                    switch (field.type) {
                        //trata os tipos de input e atribui os valores do obejto 
                        case 'file':
                            continue;
                            break;
                        case 'radio':
                            field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "][value=" + json[name] + "]");
                            field.checked = true;
                            break;
                        case 'checkbox':
                            field.checked = json[name];
                            break;
                        default:
                            field.value = json[name];
                    }

                }

            }

            this.formUpdateEl.querySelector(".photo").src = json._photo;

            this.showPanelUpdate();
        })
    }

    showPanelCreate() {
        //mostra o box de registro e esconde o de edição
        document.querySelector("#box-user-create").style.display = "block";
        document.querySelector("#box-user-update").style.display = "none";
    }

    showPanelUpdate() {
        //mostra o box de edição e esconde o registro
        document.querySelector("#box-user-create").style.display = "none";
        document.querySelector("#box-user-update").style.display = "block";
    }

    updtadeCount() {
        //atualiza a contagem dos usuarios e admins
        let numberUsers = 0;
        let numberAdmin = 0;

        [...this.tableEl.children].forEach(tr => {

            numberUsers++;

            let user = JSON.parse(tr.dataset.user);

            if (user._admin) numberAdmin++;

        });

        document.querySelector("#number-users").innerHTML = numberUsers;
        document.querySelector("#number-users-admin").innerHTML = numberAdmin;
    }

}

