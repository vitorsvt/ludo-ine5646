<header class="header">
    <a class="logo" href="/">
        <img src="/logo.png" alt="Logotipo composto por uma peça de ludo" />
        <h1>Ludo Online</h1>
    </a>

    <nav>
        <a href="/">Início</a>
        <a href="/tree">DOM</a>
        <a href="/game">Jogo</a>
    </nav>
</header>

<main>
    <article>
        <header>
            <h1>Devblog Ludo #1</h1>
            <p>
                Publicado em
                <time datetime="2025-08-25">25 de agosto de 2025</time>
            </p>
        </header>

        <p>
            Este primeiro blog servirá para detalhar o desenvolvimento do
            Projeto Web para a disciplina de Programação para Web (INE5646), da
            Universidade Federal de Santa Catarina (UFSC). Ao longo do semestre,
            novas publicações serão feitas com o intuito de apresentar as
            técnicas e soluções utilizadas para implementar as funcionalidades
            da aplicação.
        </p>

        <p>
            Como é perceptível pela página, o jogo escolhido foi o Ludo.
            Primeiramente, é importante definir a história deste jogo. Surgiu na
            Índia no século VI d.C., com o nome original sendo "Pachisi". Em
            1896, foi patenteado na Inglaterra com o nome de "Ludo" ("eu jogo"
            em latim). O objetivo do jogo é simples: vence o primeiro a dar a
            volta no tabuleiro com seus quatro peões.
        </p>

        <p>
            As regras do jogo variam de implementação a implementação, portanto
            levaremos em conta as seguintes:
        </p>

        <ul>
            <li>
                Cada jogador lança um dado em sua vez:
                <ul>
                    <li>
                        Caso tire 6, o jogador pode retirar um novo peão da casa
                        inicial e jogar o dado novamente
                    </li>
                    <li>
                        Caso contrário, o jogador deve escolher um peão para
                        andar o número de casas do número tirado
                    </li>
                </ul>
            </li>
            <li>
                O jogador só pode finalizar o percurso ao tirar o número de
                casas exato para a casa final. Caso tire um número maior, ele
                deverá retroceder o número de casas restante.
            </li>
            <li>
                Caso um peão aterrisse em uma casa ocupada pelo peão de outro
                jogador, este último deverá voltar à casa inicial.
            </li>
        </ul>

        <p>
            O desenvolvimento do projeto ainda está na primeira semana, e segue
            abaixo uma imagem do estado atual de nossa implementação:
        </p>

        <figure>
            <img
                src="/screenshot.png"
                alt="Uma screenshot de um tabuleiro de ludo em espaço 3D"
            />
            <figcaption>Estado atual da implementação</figcaption>
        </figure>

        <p>
            Finalmente, obrigado por ler a primeira publicação. Estamos muito
            ansiosos pelo desenvolvimento deste projeto e buscamos produzir uma
            aplicação de alta qualidade.
        </p>
    </article>

    <aside>
        <article>
            <h1>Projeto do Jogo</h1>
            <p>
                O objetivo do projeto é desenvolver uma aplicação Web utilizando
                os conceitos e técnicas da disciplina de Programação para Web,
                na Universidade Federal de Santa Catarina (UFSC).
            </p>

            <a
                href="https://github.com/vitorsvt/ludo"
                rel="noopener"
                target="_blank">Clique aqui para ir ao repositório do projeto</a
            >
        </article>

        <article>
            <h1>Recursos utilizados</h1>

            <ul>
                <li>Front-end: HTML5, CSS3 e JavaScript</li>
                <li>Back-end: NodeJS</li>
                <li>Banco de dados: MongoDB</li>
            </ul>
        </article>

        <article>
            <h1>Desenvolvedores</h1>
            <dl>
                <dt>Eduardo Silveira Godinho</dt>
                <dd>
                    <p>
                        Graduando de Ciências da Computação pela Universidade
                        Federal de Santa Catarina (UFSC)
                    </p>
                </dd>
                <dt>Vitor Silvestri</dt>
                <dd>
                    <p>
                        Graduando de Ciências da Computação pela Universidade
                        Federal de Santa Catarina (UFSC)
                    </p>
                </dd>
            </dl>
        </article>

        <article>
            <h1>Ciências da Computação</h1>
            <p>
                Para saber mais sobre o curso de Ciências da Computação na UFSC,
                siga este <a href="https://cco.ufsc.br/">link</a>.
            </p>
        </article>
    </aside>
</main>

<footer>
    <section>
        <h1>Links úteis</h1>
        <ul>
            <li><a href="index.html">Sobre o projeto</a></li>
            <li><a href="index.html">Objetivos</a></li>
            <li>
                <a
                    href="https://planos.inf.ufsc.br/modulos/planos/pdf.php?codigo=1162"
                    rel="noopener"
                    target="_blank">Disciplina</a
                >
            </li>
            <li>
                <a
                    href="https://github.com/vitorsvt/ludo"
                    rel="noopener"
                    target="_blank">GitHub</a
                >
            </li>
        </ul>
    </section>

    <section>
        <h1>Contato</h1>
        <address>
            <ul>
                <li>
                    <a href="mailto:dudusgodinho@gmail.com"
                        >Eduardo Silveira Godinho</a
                    >
                </li>
                <li>
                    <a href="mailto:vitorsilvestri1@gmail.com"
                        >Vitor Silvestri</a
                    >
                </li>
            </ul>
        </address>
    </section>
</footer>

<style>
    /* Resetar algumas propriedades padrões do css */

    *,
    *:before,
    *:after {
        box-sizing: border-box;
    }

    * {
        margin: 0;
        padding: 0;
    }

    img {
        max-width: 100%;
        display: block;
    }

    /* Definir algumas propriedades globais importantes para a página */

    ul,
    dd {
        margin-inline-start: 1rem;
    }

    p {
        text-align: justify;
    }

    a,
    a:visited {
        color: rgb(64, 64, 64);
    }

    .header {
        height: 3rem;
        padding: 2rem;

        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;

        .logo {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 1rem;

            img {
                height: 2rem;
            }

            h1 {
                font-size: 1rem;
            }
        }

        a {
            text-decoration: none;
            font-weight: bold;
            color: black;
        }

        nav {
            display: flex;
            gap: 2rem;
        }
    }

    main {
        display: flex;
        flex-direction: row;
        gap: 2rem;

        padding: 0 2rem 2rem 2rem;

        > article {
            display: flex;
            flex-direction: column;
            gap: 1rem;

            > p:first-of-type::first-letter {
                font-size: 2rem;
                font-weight: bold;
            }

            figure {
                text-align: center;
                margin: 2rem 0;

                img {
                    display: inline-block;
                    max-width: 50%;
                }

                figcaption {
                    font-weight: bold;
                }
            }
        }
    }

    aside {
        article {
            padding: 1rem;
            background-color: rgb(229, 229, 229);
        }

        max-width: 30%;

        display: flex;
        flex-direction: column;
        gap: 1rem;

        h1 {
            font-size: 1rem;
        }
    }

    footer {
        background-color: rgb(229, 229, 229);

        padding: 2rem;

        display: flex;
        flex-direction: row;
        justify-content: space-around;

        h1 {
            font-size: 1rem;
        }

        section {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }

        ul {
            list-style-type: none;
            margin: 0;
        }

        address {
            font-style: normal;
        }
    }
</style>
