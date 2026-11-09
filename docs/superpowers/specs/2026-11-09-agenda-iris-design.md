# Agenda da Iris: documento de design

Data: 2026-11-09. Autor: João (pedido) e Claude (redação).
Nome do projeto: **provisório** ("agenda-iris"). O João ainda não confirmou o nome, nem que a namorada se chama Iris (deduzido do endereço de outro app dele, financeiro-joao-iris). Pasta e repositório podem ser renomeados.

## 1. Intenção e porquê

O João quer dar de presente à namorada um aplicativo de organização pessoal feito só para ela. A inspiração é um vídeo viral de um namorado que fez um app de trabalho para a amiga da namorada.

**Quem é ela:** trabalha em RH na Prio (petróleo, Rio de Janeiro). O trabalho é puxado e é a fonte principal de estresse. Faz fechamento de folha (lança atestados e outras ocorrências na folha das pessoas). Uma implantação de SAP está terminando, com go-live próximo. É criativa: cria automações e partes de apps internos. Faz curso de costura todo sábado à tarde. Tem festas de família. Faz academia no próprio trabalho (fora do app) e não frequenta mais a igreja (fora do app).

**Rotina:** acorda cerca de 6h, vai de moto até Coelho Neto e depois de Uber, chegando às 9h. Passa muito tempo em trânsito. Faz home office um dia por semana, e só descobre durante a semana qual dia será.

**O problema real:** ela não esquece as coisas, pois já anota tudo numa agenda de papel. O estresse vem do trabalho. O app existe para ser **mais fácil que o papel** e para deixar o dia dela mais calmo, não para cobrar mais.

## 2. Objetivos

1. **Anotar em 2 toques.** Abrir, digitar uma frase ("atestado do João, lançar até quinta") e salvar. Data, área e tempo estimado são opcionais, com sugestão do app.
2. **Ver o dia com clareza e calma**, com tempo estimado em cada tarefa e a soma do que o dia exige.
3. **Notificações no iPhone** nos horários que ela escolher.
4. **Parecer familiar.** Navegação no padrão de Instagram e WhatsApp (Lei de Jakob), pensada primeiro para o celular.
5. **Ter cara própria**, ligada à vida dela (costura, agenda de papel, trajeto). Não pode parecer um app genérico.

## 3. Não objetivos e anti-objetivos

**Não objetivos:**
- Não integra com SAP, folha ou qualquer sistema da Prio.
- Não faz controle financeiro completo (o app de finanças do João, "Metas", já existe separado).
- Sem academia, igreja ou terapia.
- Sem uso em equipe ou multiusuário. É de uma pessoa só.

**Anti-objetivos (seria fracasso mesmo funcionando):**
- Ser mais lento que a agenda de papel.
- Virar mais uma fonte de pressão: lista enorme de atrasados, alertas vermelhos, cobrança.
- Guardar dados sensíveis de colaboradores (CPF, salário, CID, conteúdo de atestado). Só lembretes curtos como "atestado do João, lançar até quinta". O app deve desencorajar isso (ex.: aviso no campo de texto, sem campos específicos para esses dados).
- Formulário com muitos campos obrigatórios.

## 4. Restrições

- **Plataforma:** site instalável (PWA) para iPhone, salvo na tela inicial. No iOS isso exige iOS 16.4 ou mais novo para receber notificação. Notificação com o app fechado exige envio por servidor (web push), então precisa de um backend pequeno.
- **Sem app de loja** (exigiria conta Apple paga e mais trabalho). Decisão do Claude, que o João aceitou implicitamente.
- Funciona no computador também, mas o celular é o foco.
- Interface em português do Brasil.
- Repositório novo e separado, na conta do GitHub do João.
- O João usa Vercel (o app Metas está lá). Hospedar lá é opção natural, mas fica a critério do construtor.

## 5. O que o João decidiu

**Navegação (barra de baixo, 5 itens):** Hoje, Agenda, "+" no centro, Tarefas, Eu.
- **Hoje:** saudação "Bom dia, [nome]", o dia na fita métrica e só o que importa agora.
- **Agenda:** calendário, com faixa da semana. Cada dia pode ser marcado como **Presencial** ou **Home office**.
- **"+":** nova atividade ou anotação rápida.
- **Tarefas:** lista com abas (abertas, concluídas) e busca.
- **Eu:** notificações, blocos de descanso e leitura, e finanças (ver abaixo).

**Visual (escolhido pelo João): modelo A "Ateliê", misturado com post-its.**
- Fundo de linho, dia numa **fita métrica** com as horas, tarefas e horários como **etiquetas de tecido** com borda pontilhada (de costura).
- Barra de baixo com **botões de costura** como ícones e borda serrilhada; o "+" é um botão maior, laranja.
- **Regra da mistura:** etiquetas são tarefas e horários. **Post-its** com fita adesiva são as anotações rápidas e soltas.
- Ao concluir uma tarefa, um fio de costura "fecha" a etiqueta.
- Os mockups aprovados estão em `.superpowers/brainstorm/` da sessão de design (`tres-modelos.html`, `mistura-home-office.html`) e devem ser copiados para o repositório como referência.

**Home office:**
- O dia de home office é marcado em qualquer dia da semana, na Agenda ou direto na tela Hoje. Aparece como uma casinha na faixa da semana.
- Ela só toca em "Home office" e o dia fica marcado. O app **não tem bloco de trajeto** (o João decidiu que não precisa; a rotina de transporte era só contexto).

**Outros:**
- **Áreas com cores:** Trabalho, Fechamento, Costura, Família, Descanso, Leitura (e Saúde, se ela quiser).
- **Fechamento de folha:** ciclo mensal com datas de corte e etapas; o app conta os dias que faltam. O João ainda não descreveu as etapas reais.
- **Eventos fixos que se repetem:** curso de costura aos sábados à tarde. Festas de família são eventos soltos, na área Família.
- **Finanças:** uma parte pequena e opcional, em "Eu", para ela anotar um gasto ou lembrete financeiro. Nunca no centro do app.
- **Mascote:** o João ainda vai decidir. Não implementar agora.

## 6. Escolhas do Claude (o João deve conferir)

- **Sem trajeto no app.** Os mockups mostram blocos de trajeto e um aviso de home office falando de trajeto: **ignorar essas partes**, o resto do visual vale.
- **Aviso de dia carregado:** mensagem amigável tipo "hoje são 7h de coisas e só 40 min livres", nunca em vermelho nem como bronca.
- **Notificação** só para o que ela marcar, e não para tudo.
- **Sugestão após home office:** deixar para depois da primeira versão.
- **Ideias futuras (fora da primeira versão):** assistente que entende frase solta e cria a tarefa, botão "esvaziar a cabeça" para despejar tudo e organizar depois, espaço de projetos de costura, cantinho de Ideias de automação, mascote, atalho para o formulário completo de "Nova atividade" (tipo, data, prioridade, vínculo, repetição, lembrete), que fica escondido atrás de "mais detalhes".

### Escolhas adicionais depois da revisão (todas do Claude, o João confere)

- **Aviso de dia carregado:** conta só tarefas e eventos (trabalho, curso etc.), sem blocos de transporte, que não existem no app.
- **Dados e acesso:** um login simples só para ela (e-mail e senha). O João **não** tem acesso aos dados dela. Há exportação simples dos dados em "Eu".
- **Online:** o João aceitou que o app precise de internet. Sem modo offline na primeira versão.
- **Lembretes (decisão do João):** 15 a 20 minutos antes de cada tarefa com horário (padrão 15, ela pode mudar). **Notificação toda manhã** com a lista do que ela tem para fazer naquele dia. O horário dessa notificação é configurável em "Eu"; padrão 7h, que é um chute do Claude. Repetição simples (diária, semanal) para itens que se repetem. Tudo na primeira versão.
- **Editar e excluir (decisão do João):** toda tarefa, evento, anotação e lançamento pode ser editado e excluído, com "Desfazer" por alguns segundos.
- **Finanças mínimas:** uma anotação com texto e valor opcional, em "Eu". Sem categorias, sem somas e sem gráficos.
- **Tarefa vencida:** vai para uma lista discreta de "adiadas", sem vermelho e sem contador. A tela Hoje mostra só um pedido gentil, tipo "2 tarefas adiadas, quer reagendar?".
- **Dia padrão:** todo dia começa como presencial; um toque marca home office.
- **Fechamento de folha:** entra na primeira versão como um ciclo mensal em que **ela mesma** define as etapas e as datas de corte (o app só conta os dias). Não depende das etapas reais do João.
- **Aviso de dados sensíveis:** só um texto de aviso no campo de anotação, sem bloqueio nem detecção automática.
- **Mockups:** os dois arquivos (`tres-modelos.html`, `mistura-home-office.html`) vão junto com o documento, para o visual não ficar na adivinhação.

## 6b. Microinterações (pedido do João: "bonitinhas, para ela ficar feliz")

Todas no tema de costura e papel, curtas (menos de 1 segundo, exceto a tela de carregamento) e discretas. Devem respeitar a opção do iPhone "reduzir movimento". Demos em `microinteracoes.html`; o João escolhe quais entram, e se ele não escolher entram todas:

1. **Caneta riscando** a tarefa ao concluir.
2. **Carimbo "FEITO"** batendo no post-it.
3. **Agulha costurando** uma linha pontilhada ao tocar no "+", e a nova atividade aparece.
4. **Home office:** a casinha pula quando ela marca o dia.
5. **Post-it colando** na tela, com fita adesiva, ao criar uma anotação.
6. **Chuva de botões de costura** quando ela conclui tudo do dia.
7. **Tesoura cortando** a etiqueta ao excluir (com "Desfazer").
8. **Tela de carregamento:** uma agulha puxa a linha, costurando pontinhos enquanto o app abre.

## 7. Primeira versão (sugerida)

Hoje, Agenda com dia presencial ou home office, Tarefas, anotação rápida (post-it), "+" com formulário simples e "mais detalhes", áreas com cores, eventos que se repetem, notificações, visual do modelo A com post-its, e finanças mínimas em "Eu".

## 8. O que fica para o construtor

Linguagem e frameworks, onde guardar os dados e como autenticar uma única usuária, como fazer o web push, hospedagem, estrutura de pastas, como animar o fio de costura e a fita métrica, e como tratar o tempo estimado quando ela não informa.

## 9. Referências visuais (só a ideia e o efeito, nada copiado)

- Estudo de caso de app de curso de costura (paleta de moodboard de tecidos): app.uxcel.com/showcase/empty-states-sewing-academy-765
- Barras de progresso criativas (Hongkiat): www.hongkiat.com/blog/progress-bar-designs
- App Paper Planner (visual de agenda de papel): apps.apple.com/us/app/id977552680
- Washi tape para marcar blocos de tempo (Erin Condren): www.erincondren.com/blog/?p=1446
- App Metas do João (visual de família): financeiro-joao-iris.vercel.app (verde-petróleo e títulos em serifa).

## 10. Pendências

1. Nome do projeto e nome dela (usar "[nome]" até confirmar).
2. Etapas e datas reais do fechamento de folha.
3. Mascote (decisão do João).
