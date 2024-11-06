function cadastrarContato(event) {
    event.preventDefault();

    const forms = document.getElementById('contatoForms');
    const email = document.getElementById('emailContato').value;
    const telefone = document.getElementById('telContato').value;

    if (!email && !telefone) {
        alert('Insira pelo menos um email ou telefone para o contato.')
    } else {
        forms.submit()
    }
}