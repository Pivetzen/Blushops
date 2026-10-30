const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSqBY9LXfTyif_BuZHFcqtSFDvFSRrlNV-jSSgMoRa7uoKbDyrYL0yQD2csS-94Yagik_7YRGk-xm39/pub?gid=0&single=true&output=csv";

let todosProdutos = [];

// Função principal de renderização
function renderizarProdutos(produtos) {
  const container = document.getElementById("produtos-grid");
  const contador = document.getElementById("total-produtos");
  
  container.innerHTML = "";
  contador.textContent = `${produtos.length} produto(s) encontrado(s)`;

  if (produtos.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #777;">
      <h3>Nenhum produto encontrado.</h3>
      <p>Tente alterar os filtros ou a busca.</p>
    </div>`;
    return;
  }

  produtos.forEach(({ nome, imagem, categoria, plataforma, link, descricao, preco }) => {
    const platLower = plataforma.toLowerCase();
    
    // Define as classes e textos por plataforma
    let badgeClass = "badge-outros";
    let btnClass = "btn-outros";
    let btnText = "Ver Oferta ➔";

    if (platLower.includes("shopee")) {
      badgeClass = "badge-shopee";
      btnClass = "btn-shopee";
      btnText = "Ver na Shopee ➔";
    } else if (platLower.includes("hotmart")) {
      badgeClass = "badge-hotmart";
      btnClass = "btn-hotmart";
      btnText = "Acessar Curso/Material ➔";
    }

    // Formatação do Preço Estimado
    const textoPreco = preco ? `Preço estimado: a partir de ${preco}` : 'Preço: Consulte na oferta';

    const card = `
      <article class="card">
        <div class="card-image-wrapper">
          <span class="badge-plataforma ${badgeClass}">${plataforma}</span>
          <img src="${imagem}" alt="${nome}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x300?text=Sem+Imagem'" />
        </div>
        <div class="card-body">
          <span class="card-category">${categoria}</span>
          <h2 class="card-title">${nome}</h2>
          <div class="card-price">${textoPreco}</div>
          <p class="card-description">${descricao || 'Clique para conferir todos os detalhes na loja oficial.'}</p>
          <a class="btn-comprar ${btnClass}" href="${link}" target="_blank" rel="noopener noreferrer">
            ${btnText}
          </a>
        </div>
      </article>
    `;
    container.innerHTML += card;
  });
}

// Preenche os selects de filtro com valores únicos
function preencherFiltros(produtos) {
  const categorias = [...new Set(produtos.map(p => p.categoria).filter(Boolean))].sort();
  const plataformas = [...new Set(produtos.map(p => p.plataforma).filter(Boolean))].sort();

  const filtroCategoria = document.getElementById("filtro-categoria");
  const filtroPlataforma = document.getElementById("filtro-plataforma");

  filtroCategoria.innerHTML = "<option value=''>Todas as categorias</option>";
  filtroPlataforma.innerHTML = "<option value=''>Todas as plataformas</option>";

  categorias.forEach(cat => {
    filtroCategoria.innerHTML += `<option value="${cat}">${cat}</option>`;
  });
  
  plataformas.forEach(plat => {
    filtroPlataforma.innerHTML += `<option value="${plat}">${plat}</option>`;
  });
}

// Aplicação de busca e filtros combinados
function aplicarFiltros() {
  const cat = document.getElementById("filtro-categoria").value;
  const plat = document.getElementById("filtro-plataforma").value;
  const busca = document.getElementById("input-busca").value.toLowerCase().trim();

  const filtrados = todosProdutos.filter(p => {
    const atendeCategoria = !cat || p.categoria === cat;
    const atendePlataforma = !plat || p.plataforma === plat;
    const atendeBusca = !busca || 
      p.nome.toLowerCase().includes(busca) || 
      p.descricao.toLowerCase().includes(busca) ||
      p.categoria.toLowerCase().includes(busca);

    return atendeCategoria && atendePlataforma && atendeBusca;
  });

  renderizarProdutos(filtrados);
}

// Carregamento usando PapaParse
Papa.parse(csvUrl, {
  download: true,
  header: true,
  skipEmptyLines: true,
  complete: function(results) {
    // Mapeamento limpo dos dados da planilha
    todosProdutos = results.data
      .map(item => ({
        nome: item["Nome do Produto"]?.trim() || "",
        imagem: item["Imagem (URL)"]?.trim() || "",
        categoria: item["Categoria"]?.trim() || "Geral",
        plataforma: item["Plataforma"]?.trim() || "Outros",
        link: item["Link Afiliado"]?.trim() || "",
        descricao: item["Descrição"]?.trim() || "",
        preco: item["Preco"]?.trim() || item["Preço"]?.trim() || ""
      }))
      // Filtra produtos que não sejam da Amazon e mantém apenas os válidos
      .filter(p => p.nome && p.link && p.plataforma.toLowerCase() !== "amazon");

    preencherFiltros(todosProdutos);
    renderizarProdutos(todosProdutos);

    // Eventos de escuta para atualização instantânea
    document.getElementById("filtro-categoria").addEventListener("change", aplicarFiltros);
    document.getElementById("filtro-plataforma").addEventListener("change", aplicarFiltros);
    document.getElementById("input-busca").addEventListener("input", aplicarFiltros);
  },
  error: function(err) {
    console.error("Erro ao carregar os produtos:", err);
    document.getElementById("produtos-grid").innerHTML = "<p>Erro ao carregar o catálogo. Verifique a planilha.</p>";
  }
});
