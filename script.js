
const tamanhos = document.querySelectorAll(
    'input[name="tamanho"]'
);

const adicionais = [
    ...document.querySelectorAll(
        '.adicional input[type="checkbox"]'
    )
];

const formEntrega = document.getElementById("formEntrega");
const nomeInput = document.getElementById("nome");
const telefoneInput = document.getElementById("telefone");
const bairroInput = document.getElementById("bairro");

const contador = document.getElementById("contador");
const alerta = document.getElementById("alerta");
const resultado = document.getElementById("resultado");

function dinheiro(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function tamanhoSelecionado() {
    return document.querySelector(
        'input[name="tamanho"]:checked'
    ).value;
}

function adicionaisSelecionados() {
    return adicionais.filter(item => item.checked);
}

function calcularTaxaEntrega() {
    const bairro = bairroInput.value.trim();

    return bairro.toLocaleLowerCase("pt-BR") === "centro"
        ? 5
        : 10;
}

function telefoneValido() {
    const numeros = telefoneInput.value.replace(/\D/g, "");

    if (!/^[1-9]{2}9?\d{8}$/.test(numeros)) {
        return false;
    }

    const ddd = Number(numeros.slice(0, 2));

    return ddd >= 11 && ddd <= 99;
}

function atualizarPedido() {
    const tamanho = tamanhoSelecionado();
    const limite = tamanho === "300" ? 2 : 4;
    const precoBase = tamanho === "300" ? 12 : 18;

    const selecionados = adicionaisSelecionados();

    const precoExtras = selecionados.reduce(
        (soma, item) => soma + Number(item.dataset.preco),
        0
    );

    const taxa = calcularTaxaEntrega();
    const total = precoBase + precoExtras + taxa;

    contador.textContent =
        `${selecionados.length} de ${limite} adicionais selecionados`;

    adicionais.forEach(item => {
        item.disabled =
            !item.checked && selecionados.length >= limite;
    });

    document.getElementById("textoTamanho").textContent =
        `${tamanho} ml`;

    document.getElementById("precoBase").textContent =
        dinheiro(precoBase);

    document.getElementById("precoAdicionais").textContent =
        dinheiro(precoExtras);

    document.getElementById("taxaEntrega").textContent =
        dinheiro(taxa);

    document.getElementById("nomesAdicionais").textContent =
        selecionados.length
            ? selecionados.map(item => item.value).join(", ")
            : "Nenhum";

    document.getElementById("total").textContent =
        dinheiro(total);
}

function mostrarAlerta(mensagem) {
    alerta.textContent = "⚠️ " + mensagem;
    alerta.style.display = "block";
}

function esconderAlerta() {
    alerta.style.display = "none";
}

adicionais.forEach(item => {
    item.addEventListener("change", () => {
        const limite =
            tamanhoSelecionado() === "300" ? 2 : 4;

        if (adicionaisSelecionados().length > limite) {
            item.checked = false;
            mostrarAlerta(
                `Você pode escolher no máximo ${limite} adicionais.`
            );
        } else {
            esconderAlerta();
        }

        resultado.style.display = "none";
        atualizarPedido();
    });
});

tamanhos.forEach(item => {
    item.addEventListener("change", () => {
        const limite =
            tamanhoSelecionado() === "300" ? 2 : 4;

        const selecionados = adicionaisSelecionados();

        if (selecionados.length > limite) {
            selecionados.slice(limite).forEach(adicional => {
                adicional.checked = false;
            });

            mostrarAlerta(
                `O copo escolhido permite até ${limite} adicionais. ` +
                "Alguns foram desmarcados."
            );
        } else {
            esconderAlerta();
        }

        resultado.style.display = "none";
        atualizarPedido();
    });
});

bairroInput.addEventListener("input", () => {
    atualizarPedido();
    resultado.style.display = "none";
});

telefoneInput.addEventListener("input", () => {
    telefoneInput.setCustomValidity("");
    resultado.style.display = "none";
});

document.getElementById("botaoConfirmar")
    .addEventListener("click", () => {
        resultado.style.display = "none";

        if (!formEntrega.reportValidity()) {
            return;
        }

        if (!nomeInput.value.trim()) {
            nomeInput.setCustomValidity("Informe seu nome.");
            nomeInput.reportValidity();
            nomeInput.setCustomValidity("");
            return;
        }

        if (!bairroInput.value.trim()) {
            bairroInput.setCustomValidity("Informe seu bairro.");
            bairroInput.reportValidity();
            bairroInput.setCustomValidity("");
            return;
        }

        if (!telefoneValido()) {
            telefoneInput.setCustomValidity(
                "Informe um telefone válido com DDD."
            );
            telefoneInput.reportValidity();
            telefoneInput.setCustomValidity("");
            return;
        }

        const tamanho = tamanhoSelecionado();
        const limite = tamanho === "300" ? 2 : 4;
        const selecionados = adicionaisSelecionados();

        if (selecionados.length > limite) {
            mostrarAlerta(
                `O copo de ${tamanho} ml permite até ${limite} adicionais.`
            );
            return;
        }

        esconderAlerta();

        const taxa = calcularTaxaEntrega();
        const precoBase = tamanho === "300" ? 12 : 18;

        const precoExtras = selecionados.reduce(
            (soma, item) => soma + Number(item.dataset.preco),
            0
        );

        const total = precoBase + precoExtras + taxa;

        resultado.replaceChildren();

        const titulo = document.createElement("strong");
        titulo.textContent = "Pedido validado com sucesso!";

        const detalhes = document.createElement("p");
        detalhes.textContent =
            `Cliente: ${nomeInput.value.trim()} | ` +
            `Telefone: ${telefoneInput.value.trim()} | ` +
            `Bairro: ${bairroInput.value.trim()} | ` +
            `Copo: ${tamanho} ml | ` +
            `Taxa: ${dinheiro(taxa)} | ` +
            `Total: ${dinheiro(total)}.`;

        const observacao = document.createElement("p");
        observacao.textContent =
            "Esta é uma demonstração. O pedido ainda não foi enviado à loja.";

        resultado.append(titulo, detalhes, observacao);
        resultado.style.display = "block";
    });

document.getElementById("botaoLimpar")
    .addEventListener("click", () => {
        formEntrega.reset();
        tamanhos[0].checked = true;

        adicionais.forEach(item => {
            item.checked = false;
            item.disabled = false;
        });

        esconderAlerta();
        resultado.style.display = "none";
        atualizarPedido();
    });

atualizarPedido();
