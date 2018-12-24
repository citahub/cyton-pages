const apiKeyToken = "T9GV1IF4V7YDXQ8F53U1FK2KHCE2KUUD8Z";

const profileSchema = token =>
  `https://raw.githubusercontent.com/consenlabs/token-profile/master/erc20/${token}.json`;
const coinSchema = coin =>
  `https://raw.githubusercontent.com/consenlabs/token-profile/master/coins/${coin}.json`;
const imageSchema = img =>
  `https://raw.githubusercontent.com/consenlabs/token-profile/master/images/${img}.png`;
const totalSupplySchema = token =>
  `https://api.etherscan.io/api?module=stats&action=tokensupply&contractaddress=${token}&apikey=${apiKeyToken}`;

const urlParams = new URLSearchParams(window.location.search);

const coinImages = {
  ethereum: "https://cdn.cryptape.com/VvzovUCU4k9wyHZGTDNjHD5v"
};

let token = urlParams.get("token");
let coin = urlParams.get("coin");
let addr = "";
let imgAddr = "";

// dom
const logoImg = document.getElementById("logo");
const titleText = document.getElementById("title");
const priceText = document.getElementById("price");
const ctrAddrText = document.getElementById("ctr-addr");
const websiteLink = document.getElementById("website-url");
const linksDiv = document.getElementById("links");
const overviewText = document.getElementById("overview");
const statusText = document.getElementById("status");
const publishedOnText = document.getElementById("published-on");
const totalSupplyText = document.getElementById("total-supply");
const totalSupplyTitleText = document.getElementById("total-supply-title");
const totalValueText = document.getElementById("total-value");
const totalValueTitleText = document.getElementById("total-value-title");

const getTotoalValue = () => {
  if (window.priceHidden) {
    return;
  }
  if (typeof window.price !== "string" || !window.totalSupply) {
    totalValueText.style = "display: none";
    return;
  }
  const _value = window.price.match(/\d+/);
  if (!_value) return;
  const value = _value.toString() * window.totalSupply;
  const unit = window.price.slice(0, _value.index);
  const totalValue = unit + value.toLocaleString();
  totalValueText.style = "display: block";
  setInfo(totalValueText, totalValue);
};

const setInfo = (dom, content) => {
  if (!content) {
    dom.parentElement.style = "display: none;";
  } else {
    dom.innerText = content;
  }
};

const hidePrice = () => {
  window.priceHidden = true;
  document.getElementById("price-container").style = "display: none;";
  setInfo(totalValueText, "");
};

const getTotalSupply = token => {
  const totalSupplyUrl = totalSupplySchema(token);
  fetch(totalSupplyUrl)
    .then(res => res.json())
    .then(supply => {
      if (supply.status === "1") {
        window.totalSupply = +supply.result;
        totalSupplyTitleText.style = "display:block";
        totalSupplyText.style = "display:block";
        // getTotoalValue();
        setInfo(totalSupplyText, (+supply.result).toLocaleString());
      } else {
        setInfo(totalSupplyTitleText, "");
      }
    })
    .catch(err => {
      window.console.error("fetch total supply failed");
      setInfo(totalSupplyTitleText, "");
      setInfo(totalSupplyText, "");
      hidePrice();
    });
};

const handlePrice = price => {
  if (price) {
    window.priceHidden = false;
    window.price = price;
    setInfo(priceText, price);
    // getTotoalValue();
  } else {
    hidePrice();
  }
};
Object.defineProperty(window, "handlePrice", {
  value: handlePrice
});

// const getTokenPrice = (symbol, callback) => { }

const setSocialIcons = links => {
  if (!links) {
    linksDiv.parentElement.style = "display: none";
    return;
  }
  const frag = document.createDocumentFragment();
  Object.keys(links).map(name => {
    const link = document.createElement("a");
    link.title = name;
    link.href = links[name];
    link.innerHTML = `
      <svg class="icon" aria-hidden="true">
        <use xlink: href="#icon-${name}"></use>
      </svg >
    `;
    frag.appendChild(link);
  });
  linksDiv.appendChild(frag);
};

if (token) {
  addr = profileSchema(token);
  imgAddr = imageSchema(token);
}
if (coin) {
  addr = coinSchema(coin);
  imgAddr = coinImages[coin];
}
const handleProfile = profile => {
  profile.icon = imgAddr;

  logoImg.src = profile.icon;
  websiteLink.href = profile.website;
  setInfo(titleText, profile.symbol);
  setInfo(websiteLink, profile.website);
  setInfo(ctrAddrText, token);
  if (token) {
    setInfo(
      overviewText,
      profile.overview ? profile.overview.zh || profile.overview.en : ""
    );
  }
  if (coin) {
    setInfo(overviewText, profile.overview || "");
  }
  setInfo(publishedOnText, profile.published_on);
  setInfo(statusText, profile.state);
  setSocialIcons(profile.links);
  // get token price
  // handlePrice("$100")
  let platform = parsedUserAgent().platform;
  if (platform == "android") {
    window.tokenPricePlugin.getTokenPrice(profile.symbol, "handlePrice");
  } else if (platform == "ios") {
    window.webkit.messageHandlers.getTokenPrice.postMessage({
      symbol: "ETH",
      callback: "handlePrice"
    });
  }
};

const parsedUserAgent = () => {
  const userAgent = navigator.userAgent;
  let str = userAgent.split("Neuron(")[1];
  if (str === undefined) {
    console.warn("Not found Neuron info");
    return {
      platform: "ios",
      version: "0.0.0.000000",
      notNeuron: true
    };
  } else {
    str = str.split(")")[0];
  }
  const info = {};
  const keytable = {
    Platform: "platform",
    AppVersion: "version"
  };
  str.split("&").forEach(s => {
    const l = s.split("=");
    const key = keytable[l[0]] || l[0].toLowerCase();
    info[key] = l[1].toLowerCase();
  });
  return info;
};

fetch(addr)
  .then(res => res.json())
  .then(handleProfile);

// get total supply from etherscan
getTotalSupply(token || coin);
