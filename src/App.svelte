<script>
  import Scroller from "@sveltejs/svelte-scroller";
  import Mapy from "./Map.svelte";
  import { fly } from "svelte/transition";

  export let curated;
  export let list;

  list.map(d => {
    d.visible = true;
    return d;
  })

  let listFiltered = list;
  let countries = [...new Set(list.map((d) => d.country))];
  let selectedCountry;
  let CountryLat = 20, CountryLong = 100, CountryZoom = 3;
  let fullscreen = false;
  let selectedMarkers;
  let activeMarkers = list;
  let index = 0,
    offset,
    progress;
  let home = "/img/home.png";

  function cinemaFilter(d) {
    selectedMarkers = d.split(",");
    activeMarkers = list.map((d) => {
      if(selectedMarkers.includes(d.cinemaId)) {
        d.visible = true;
        } else {
        d.visible = false;
        }
      return d;
    });
    return activeMarkers;
  }

  function filter(d) {
    selectedCountry = d;
    listFiltered =
      selectedCountry === "all"
        ? list.map(d => {
          d.visible = true;
          return d;
        })
        : list.map((d) => {if (d.country === selectedCountry) {
            CountryLat = d.CountryLat;
            CountryLong = d.CountryLong;
            CountryZoom = d.CountryZoom;
            d.visible = true;
          } else {
            d.visible = false;
          }
          return d;
        });
  }


  function toggle() {
    fullscreen = fullscreen ? false : true;
    if (fullscreen === true) {
      list.map(d => {
          d.visible = true;
          return d;
        })
    }
  }
</script>

<main>
  <div class="content">
    <div class="topbar">
      <div class="homeLink">
        <a href={curated[0].projectHomeLink}
          ><img
            src={home}
            alt="home"
            width="24px"
            height="24px"
            style="margin-right:10px"
          /> Back to project home</a>
      </div>
      <button on:click={toggle}
        >{fullscreen ? "Back to curated overview" : "Explore map"}
      </button>
    </div>
    <!-- svelte-ignore a11y-no-onchange -->
    <div class="nav">
      {#if fullscreen}
        <select
          transition:fly={{ y: -100, duration: 500 }}
          bind:value={selectedCountry}
          on:change={filter(selectedCountry)}
        >
          <option value="all">All countries</option>
          {#each countries as country}
            <option value={country}>
              {country}
            </option>
          {/each}
        </select>
      {/if}
    </div>

    <Scroller top={0} bottom={0.8} bind:index bind:offset bind:progress>
      <div slot="background" id="mapid" class="map">
        <Mapy
          lat={fullscreen
            ? selectedCountry === "all"
              ? 20
              : CountryLat
            : curated[index].lat}
          long={fullscreen
            ? selectedCountry === "all"
              ? 100
              : CountryLong
            : curated[index].long}
          zoom={fullscreen
            ? selectedCountry === "all"
              ? 3
              : CountryZoom
            : curated[index].zoom}
          list={fullscreen
            ? listFiltered
            : cinemaFilter(curated[index].cinemas)}
          {fullscreen}
          
          
        />
      </div>

      <div slot="foreground">
        <div class="panel-left {fullscreen ? 'hide' : 'show'}">
          <div class="content-containerIntro">
            <section>{@html curated[0].intro}</section>
            <div class="scrollDown">
              <img
                src="../img/arrow_down.png"
                alt="scrollDown"
                width="48"
                height="48"
              />
              Scroll Down
            </div>
            <hr class="intro" />
          </div>

          {#each curated as d, i}
            {#if i !== 0}
              <section>
                <div class="content-container">
                  <h2>{d.slideTitle}</h2>
                  <p>
                    {@html d.text}
                  </p>
                  {#if d.squarespacelink !== ""}
                    <a href={d.squareSpaceLink}>Read full article.</a>
                  {/if}
                </div>

                {#if d.imageLink !== ""}
                  <div class="img-container center-cropped">
                    <img src={d.imageLink} alt="" />
                  </div>
                {/if}

                {#if d.youtubeEmbedLink !== ""}
                  <div class="img-container">
                    <!-- svelte-ignore a11y-missing-attribute -->
                    <iframe
                      src={d.youtubeEmbedLink}
                      frameborder="0"
                      allowfullscreen
                      class="video"
                    />
                  </div>
                {/if}

                {#if d.soundcloudiframe !== ""}
                  {@html d.soundcloudIframe}
                {/if}

                <hr class="slides" />
              </section>
            {/if}
          {/each}
          <div class="button-container">
            <p>
              Don't see your favorite cinema here? <br />We'd like to hear from
              you!
            </p>
            <button onclick="window.open('https://forms.gle/bdWFVUhQ4oYcEgZ77')"
              >Suggest a space</button>
          </div>
          <br />
          <p class="footer">
            Designed and developed by Laura Aragó, Spe Chen, Víctor Garcia and Santiago Salcido in the 
            <a href="http://www.mastervisualtoolsudg.com/" target="blank"> Master’s program in Visual Tools to Empower Citizens</a>
          </p>
        </div>
      </div>
    </Scroller>
  </div>
</main>

<style>
  .topbar {
    background-color: #f1f1f1;
    border-bottom: 1px solid #bdbdbd;
    z-index: 1000;
    position: fixed;
    width: 100%;
    height: 66px;
  }
  .topbar a {
    font-family: "Parmigiano Sans";
    font-size: inherit;
    cursor: pointer;
    font-style: normal;
    font-weight: normal;
    color: #212121;
    text-align: top;
    display: flex;
    align-items: center;
  }
  .homeLink {
    position: absolute;
    left: 0;
    top: 0px;
    bottom: 0px;
    margin: 13px;
    padding: 9px;
    margin-left: 6px;
    cursor: pointer;
    pointer-events: all;
    font-size: 14px;
  }

  .topbar button {
    position: absolute;
    right: 0px;
    top: 0px;
    bottom: 0px;
    margin: 13px;
    border: 1px solid #212121;
    box-shadow: -2px 2px 0px #757575;
    background: #ffffff;
    display: flex;
    font-size: 14px;
  }
  section {
    width: 100%;
    display: block;
  }

  .content {
    pointer-events: none;
    margin: 0;
    padding: 0;
  }

  .content section {
    pointer-events: all;
  }

  .map,
  button {
    pointer-events: all;
  }

  select {
    pointer-events: all;
  }

  .hide {
    margin-left: -50vw;
  }
  .show {
    margin-left: 0;
  }

  main {
    text-align: left;
    padding: 0;
    max-width: 240px;
    margin: 0;
  }

  .panel-left {
    background-color: white;
    max-width: 708px;
    pointer-events: all;
    transition: all 1s;
    padding: 0px 0px 104px;
    box-shadow: 2px 0px 8px rgba(0, 0, 0, 0.25);
  }

  #mapid {
    margin-left: 0;
    width: 100%;
    height: 100vh;
    top: 40px;
  }

  .nav {
    position: fixed;
    z-index: 150;
    top: 81px;
    right: 13px;
  }

  .img-container img {
    width: 100%;
    display: inline-block;
  }

  .content-container {
    padding: 78px 122px 122px;
  }

  .content-containerIntro {
    padding: 172px 122px 0px 122px;
  }

  .video {
    width: 100%;
    min-height: 398px;
  }

  .button-container {
    width: 50%;
    margin: 0 auto;
    margin-top: 2em;
    text-align: center;
  }

  .footer {
    text-align: center;
    font-size: 0.8em;
    width: 75%;
    margin: auto;
    padding-top: 5em;
    color: gray;
  }

  /* MEDIA QUERIES */
  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }

  @media (min-width: 320px) {
    main {
      max-width: none;
    }
  }

  /* Medium devices (landscape tablets, 768px and down) */
  @media only screen and (max-width: 768px) {
    .panel-left {
      max-width: 100%;
    }
    .content-containerIntro {
      padding: 156px 61px 0px 61px;
    }
    .content-container {
      padding: 78px 61px 61px;
    }
    hr.intro {
      max-width: 768px;
    }
    hr.slides {
      max-width: 768px;
    }
    .video {
      width: 100%;
      min-height: 432px;
    }
    .hide {
      margin-left: -100vw;
    }
  }
  /* Laptop (1024px and down) */
  @media only screen and (max-width: 1024px) {
    .hide {
      margin-left: -100vw;
    }
  }

  /* Mobile L (large phones, 425px and down) */
  @media only screen and (max-width: 425px) {
    .video {
      width: 100%;
      min-height: 239px;
    }
    .content-containerIntro {
      padding: 130px 26px 0px 26px;
    }
    .hide {
      margin-left: -100vw;
    }
  }

  /* Small devices (phones, 375px and down) */

  @media only screen and (max-width: 375px) {
    .panel-left {
      max-width: 100%;
    }
    .content-containerIntro {
      padding: 130px 26px 0px 26px;
    }
    .content-container {
      padding: 52px 26px 52px;
    }
    hr.intro {
      margin-top: 52px;
      max-width: 323px;
    }
    hr.slides {
      margin-top: 52px;
      max-width: 323px;
    }
    .video {
      width: 100%;
      min-height: 211px;
    }
    .hide {
      margin-left: -100vw;
    }
  }
</style>
