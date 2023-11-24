1. **Alimento Table:**

```sql
CREATE TABLE alimento (
    id SERIAL PRIMARY KEY,
    nome_alimento VARCHAR(255) NOT NULL,
    descricao_alimento TEXT,
    calorias FLOAT,
    proteinas FLOAT,
    carboidratos FLOAT,
    gorduras FLOAT,
    valor_energetico FLOAT,
    tamanho_porcao VARCHAR(255),
    nutrientes TEXT,
    fonte VARCHAR(255),
    instrucoes_preparo TEXT,
    requisitos_armazenamento TEXT,
    indice_glicemico FLOAT,
    carga_glicemia FLOAT,
    fibra FLOAT,
    imagem_alimento TEXT,
    individual_grade TEXT,
    combined_grade TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN,
    excluido_em TIMESTAMPTZ,
    arquivado BOOLEAN,
    created_by_id INTEGER,
    updated_by_id INTEGER
);
```

2. **Analise Table:**

```sql
CREATE TABLE analise (
    id SERIAL PRIMARY KEY,
    id_dieta INTEGER,
    data_analise DATE,
    provedor_analise VARCHAR(255),
    resultados_analise TEXT,
    recomendacoes_analise TEXT,
    carimbo_analise TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    tipo_analise VARCHAR(255),
    parametros_analisados TEXT,
    faixas_referencia TEXT,
    custo_analise FLOAT,
    interpretacao_analise TEXT,
    datas_referencia_resultados TEXT,
    duracao_refeicao INTEGER,
    estado_emocional_refeicao VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    excluido_em TIMESTAMPTZ,
    arquivado BOOLEAN,
    created_by_id INTEGER,
    updated_by_id INTEGER
);
```

3. **Refeicao Table:**

```sql
CREATE TABLE refeicao (
    id SERIAL PRIMARY KEY,
    id_dieta INTEGER,
    nome_refeicao VARCHAR(255),
    tipo_refeicao VARCHAR(255),
    hora_refeicao TIME,
    local_refeicao VARCHAR(255) DEFAULT 'Não especificado',
    companheiros_refeicao TEXT,
    humor_refeicao VARCHAR(255),
    nivel_satisfacao INTEGER,
    notas_refeicao TEXT,
    nivel_fome_antes_refeicao INTEGER,
    nivel_fome_apos_refeicao INTEGER,
    custo_refeicao FLOAT,
    tempo_preparo_refeicao INTEGER,
    duracao_refeicao INTEGER,
    estado_emocional_refeicao VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN,
    excluido_em TIMESTAMPTZ,
    arquivado BOOLEAN,
    created_by_id INTEGER,
    updated_by_id INTEGER
);
```

4. **User Table:**

```sql
CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    tipo_usuario VARCHAR(255),
    nome_dieta VARCHAR(255),
    data_refeicao DATE,
    tipo_dieta VARCHAR(255),
    descricao_dieta TEXT,
    hora_inicio_refeicao TIME,
    hora_fim_refeicao TIME,
    peso_usuario FLOAT,
    altura_usuario FLOAT,
    nivel_atividade VARCHAR(255),
    meta_dieta TEXT,
    meta_dieta_especifica TEXT,
    restricoes_dieteticas TEXT,
    preferencias_alimentares TEXT,
    medicamentos_atuais TEXT,
    historico_medico TEXT,
    coluna_analise_1 TEXT,
    coluna_analise_2 TEXT,
    coluna_analise_3 TEXT,
    peso_atual FLOAT,
    imc FLOAT,
    circunferencia_cintura FLOAT,
    pressao_sanguinea VARCHAR(255),
    calorias FLOAT,
    proteinas FLOAT,
    carboidratos FLOAT,
    gorduras FLOAT,
    valor_energetico FLOAT,
    id_alimento INTEGER REFERENCES alimento(id),
    id_refeicao INTEGER REFERENCES refeicao(id),
    data_inicio_dieta DATE,
    data_fim_dieta DATE,
    metas TEXT,
    alimentos_recomendados TEXT,
    alimentos_evitados TEXT,
    genero VARCHAR(255),
    data_nascimento DATE,
    nivel_atividade_usuario VARCHAR(255),
    objetivos_saude TEXT,
    percentual_gordura FLOAT,
    biografia_usuario TEXT,
    nivel_satisfacao_refeicoes TEXT,
    feedback_refeicoes TEXT,
    objetivos_saude_especificos TEXT,
    historico_peso TEXT,
    criado_em TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN,
    archived BOOLEAN,
    created_by_id INTEGER,
    updated_by_id INTEGER
);
```
