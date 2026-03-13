---
title: Interactive API (Scalar)
hide:
  - navigation
  - toc
---

<style>
  .md-content { padding: 0 !important; }
  .md-content__inner {
    margin: 0 !important;
    padding: 0 !important;
    max-width: 100% !important;
  }

  .scalar-embed {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    top: 48px;
    z-index: 1;
    border: none;
    background: #0f0f17;
  }

  .scalar-embed iframe {
    width: 100%;
    height: 100%;
    border: none;
    display: block;
    background: #0f0f17;
  }
</style>

<div class="scalar-embed" id="scalar-embed">
  <iframe
    src="../scalar-ui.html"
    title="Interactive API Reference — Orders Platform"
    loading="lazy"
    allowfullscreen>
  </iframe>
</div>

<script>
  (function () {
    function adjust() {
      var header = document.querySelector('[data-md-component="header"]');
      var tabs   = document.querySelector('.md-tabs');
      var offset = (header ? header.offsetHeight : 48)
                 + (tabs   ? tabs.offsetHeight   : 0);
      var embed  = document.getElementById('scalar-embed');
      if (embed) embed.style.top = offset + 'px';
    }
    document.addEventListener('DOMContentLoaded', adjust);
    window.addEventListener('resize', adjust);
  })();
</script>
