<script>
  import { Map, Marker } from "@beyonk/svelte-mapbox";
  import { fly } from 'svelte/transition'
 
  export let list;
  export let lat;
  export let long;
  export let zoom;
  export let fullscreen;

  let cinActive;
  let showPanel = [...new Array(list.length)].map(d => false);
  let mapComponent;

  function onReady() {
    mapComponent.setCenter([48.6767356, 27.7236434], 4.23);
  }


  function checkLinkType(link){
    return link.includes("instagram")? "Instagram"
          : link.includes("facebook")? "Facebook"
          : "site"
   }

   
   $:if(mapComponent) { mapComponent.flyTo({
    center: [
      long,
      lat
    ],
    zoom: zoom})}

</script>

<Map
  accessToken="pk.eyJ1IjoibXZ0ZWMiLCJhIjoiY2ttbzVkdnhuMDFjMjJvbWE0c2F0bTZybiJ9.H7TNF1Ff7uS8XnmMt9c7vQ"
  style="mapbox://styles/mvtec/ckmo5l59o2tn317ntlzf32krk"
  bind:this={mapComponent}
  on:ready={onReady}
  zoom=2
>
  {#each list as d,i}
    <Marker
      lat={d.lat}
      lng={d.long}
      color="#32749C00"
      label= "<img src='{d.imgLink}' width='100%'></br>
              <b class='title'>{ d.cinemaName }</b><br>
              <span class='titleNative'>{d.cinemaNameNative}</span>
              <p>{d.address}</p>
              <p>{d.desc}</p>
              <a href='{d.websiteLink}' target='_blank'><p>Link to {checkLinkType(d.websiteLink)}</a>
              <a href='{d.googleMapLink}' target='_blank'><p>View location on Google map</p></a>
              "
      popup={true}
      visible={d.visible} 
      cinema= {d.cinemaId}
      bind:show={showPanel[i]}
      bind:showncinema={cinActive}
    />
    <div>
      {#if fullscreen && cinActive === d.cinemaId}
      {#if showPanel[i]}
        <div class="panel-left2" transition:fly={{x:-600}}>

          <div class="content-container2">
            {#if d.imglinkInfotab !== ""}
              <div class="img-container2 center-cropped">
                <img src={d.imgLinkInfotab} alt="" />
              </div>
           {/if}
            <h2>{d.InfotabTitle}</h2>
            <p class="content2">
              {@html d.InfotabText}
            </p>
          </div>
        </div>
      {/if}
      {/if}
    </div>
  {/each}
</Map>

<style>
  h2 {
    color: #ffffff;
  }
  .panel-left2 {
    position: fixed;
    background-color: #212121;
    max-width: 708px;
    height: 100%;
    pointer-events: all;
    transition: all 1s;
    padding: 0px 0px 104px;
    box-shadow: 2px 0px 8px rgba(0, 0, 0, 0.75);
    z-index: 50;
    overflow-y: scroll;
  }
  .content-container2 {
    padding: 172px 122px 122px;
  }
  .img-container2 {
    margin: 26px 0px;
  }
  .img-container2 img {
    width: 100%;
    display: inline-block;
  }
  .hide {
    margin-left: -50vw;
  }
  .show {
    margin-left: 0;
  }

   /* MEDIA QUERIES */
  /* Medium devices (landscape tablets, 768px and down) */
  @media only screen and (max-width: 768px) {
    .panel-left2 {
      max-width: 100%;
    }
    .content-container2 {
      padding: 130px 61px 61px;
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
    .hide {
      margin-left: -100vw;
    }
  }

  /* Small devices (phones, 375px and down) */

  @media only screen and (max-width: 375px) {
    .panel-left2 {
      max-width: 0%;
    }
    .content-container2 {
      padding: 130px 26px 52px;
    }
    .hide {
      margin-left: -100vw;
    }
  }
</style>