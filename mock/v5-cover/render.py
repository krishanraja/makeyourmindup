"""Capture the static cover from disk. Run on the rendering host."""
import asyncio
import os
import subprocess
from contextlib import nullcontext
from pathlib import Path
from unittest.mock import patch

from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
OUT = HERE / "out"


async def anonymous_driver(*command, limit, **kwargs):
    """Use anonymous stdio on Windows where asyncio named pipes are restricted."""
    proc = subprocess.Popen(command, **kwargs)

    class Reader:
        async def readexactly(self, length):
            data = await asyncio.to_thread(proc.stdout.read, length)
            if len(data) != length:
                raise asyncio.IncompleteReadError(data, length)
            return data

    class Writer:
        def write(self, data):
            proc.stdin.write(data)
            proc.stdin.flush()

        def close(self):
            proc.stdin.close()

    class Driver:
        stdin = Writer()
        stdout = Reader()

        async def communicate(self):
            await asyncio.to_thread(proc.wait)
            proc.stdout.close()

    return Driver()


COVER_STATES = (
    "fresh", "stale", "feed-down", "one", "two", "nocover", "longtitle",
    "nowatch", "sub-empty", "sub-invalid", "sub-sent", "nojs", "reduced",
)
HEIGHT = {320: 844, 390: 844, 768: 1024, 1024: 768, 1440: 900, 1920: 1080}


def check_panels(page, width):
    panels = page.locator(".panel").evaluate_all("""panels => panels.map(panel => {
        const frame = panel.getBoundingClientRect();
        const photo = panel.querySelector('img').getBoundingClientRect();
        const title = panel.querySelector('strong').getBoundingClientRect();
        return {top: frame.top, height: frame.height, width: frame.width,
                title_bottom: title.bottom - frame.top,
                edge_error: Math.max(...['top', 'right', 'bottom', 'left']
                    .map(edge => Math.abs(frame[edge] - photo[edge])))};
    })""")
    assert len(panels) == 5
    first = panels[0]
    for panel in panels:
        assert panel["edge_error"] < 1, panel
        assert abs(panel["height"] - first["height"]) < 1, panel
        assert abs(panel["title_bottom"] - first["title_bottom"]) < 1, panel
        if width <= 700:
            assert abs(panel["height"] - panel["width"] * 0.75) < 1, panel
        else:
            assert abs(panel["top"] - first["top"]) < 1, panel


def capture(browser, file, width, state="", grid=False):
    page = browser.new_page(
        viewport={"width": width, "height": HEIGHT[width]},
        device_scale_factor=1, offline=True, java_script_enabled=state != "nojs",
        reduced_motion="reduce" if state == "reduced" else "no-preference",
    )
    name = f"v2-{file}-{state or 'default'}-{width}" + ("-grid" if grid else "")
    try:
        page.goto(f"{(HERE / (file + '.html')).as_uri()}?state={state}&grid={int(grid)}")
        page.evaluate("document.fonts.ready")
        page.evaluate("Promise.all([...document.images].map(image => image.decode()))")
        if state == "wrong-code":
            page.get_by_text("That code didn't work.", exact=True).wait_for()
        page.wait_for_timeout(500)
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), name
        if file == "index":
            if width in (390, 1440):
                assert page.locator(".hero .subscribe").evaluate(
                    "form => form.getBoundingClientRect().bottom <= innerHeight"
                ), f"{name}: form below first screen"
            for title in page.locator(".cards h3").all():
                assert title.evaluate("""el => {
                    const style = getComputedStyle(el);
                    return style.textTransform === 'uppercase' &&
                        el.scrollWidth <= el.clientWidth &&
                        el.getBoundingClientRect().height <= 3 * parseFloat(style.lineHeight) + 1;
                }"""), f"{name}: title exceeds fit rules: {title.inner_text()}"
        if file == "index" and state == "fresh" and width in (1024, 1440, 1920):
            assert page.evaluate("""() => {
                const box = selector => document.querySelector(selector).getBoundingClientRect();
                const hero = box('.hero'), image = box('.hero-photo img');
                const gutter = parseFloat(getComputedStyle(document.querySelector('.hero')).columnGap);
                return Math.abs(image.left - (hero.left + (hero.width + gutter) / 2)) < 1 &&
                    Math.abs(image.right - box('#open-sheet').right) < 1 &&
                    Math.abs(image.top - box('.hero-mark').top) < 1 &&
                    Math.abs(image.bottom - box('.hero .subscribe small').bottom) < 1;
            }"""), f"{name}: hero alignment"
        if file == "index" and state == "fresh" and width in (390, 1440):
            page.locator(".hero").screenshot(path=OUT / f"{name}-hero.png")
            page.evaluate("window.scrollTo(0, 0)")
        page.screenshot(path=OUT / f"{name}.png")
        page.screenshot(path=OUT / f"{name}-full.png", full_page=True)
        if file == "index" and state == "fresh" and width in (390, 1440):
            check_panels(page, width)
            for band in ("week", "recent"):
                page.locator("#" + band).evaluate("el => el.scrollIntoView()")
                page.mouse.move(0, 0)
                page.wait_for_timeout(500)
                page.screenshot(path=OUT / f"{name}-{band}-closed.png")
                page.locator("#open-sheet").click()
                assert page.locator("dialog").is_visible()
                page.screenshot(path=OUT / f"{name}-{band}-sheet.png")
                page.locator("#close-sheet").click()
            panel = page.locator(".panel").first
            panel.locator("summary").focus()
            page.keyboard.press("Enter")
            assert panel.evaluate("el => el.open")
            page.wait_for_timeout(500)
            check_panels(page, width)
            page.screenshot(path=OUT / f"{name}-recent-open.png")
    finally:
        page.close()


def capture_cases():
    for width in HEIGHT:
        yield ("index", width, "fresh")
        if width == 320:
            yield ("index", width, "longtitle")
        if width in (390, 1440):
            for state in COVER_STATES[1:]:
                yield ("index", width, state)
            yield ("index", width, "fresh", True)
            for state in ("locked", "wrong-code", "unlocked", "no-code"):
                yield ("members", width, state)
            for file in ("legal", "terms", "404"):
                yield (file, width)


def main():
    OUT.mkdir(exist_ok=True)
    stdio = (patch("asyncio.create_subprocess_exec", anonymous_driver)
             if os.name == "nt" else nullcontext())
    with stdio, sync_playwright() as engine:
        browser = engine.chromium.launch(channel="chromium", headless=True,
                                         args=["--disable-background-networking", "--allow-file-access-from-files"])
        failures = []
        for case in capture_cases():
            try:
                capture(browser, *case)
            except Exception as exc:
                failures.append(f"{case}: {type(exc).__name__}: {exc}")
        browser.close()
    if failures:
        raise SystemExit("Failed captures:\n" + "\n".join(failures))


if __name__ == "__main__":
    main()
