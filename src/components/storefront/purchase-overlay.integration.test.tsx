import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import React from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { CartProvider } from "@/context/CartContext"
import { CurrencyProvider } from "@/context/CurrencyContext"
import { LanguageProvider } from "@/context/LanguageContext"
import { WishlistProvider } from "@/context/WishlistContext"
import { buildStorefrontProduct } from "@/lib/storefront/product"
import ChatWidget from "@/components/ChatWidget"
import ProductPurchasePanel from "./ProductPurchasePanel"

const navigationState = vi.hoisted(() => ({
  pathname: "/artwork/ink-garden-01",
}))

vi.mock("next/navigation", () => ({
  usePathname: () => navigationState.pathname,
}))

type Observation = {
  isIntersecting: boolean
  top: number
  bottom: number
}

class ControlledIntersectionObserver implements IntersectionObserver {
  static instances: ControlledIntersectionObserver[] = []

  readonly root = null
  readonly rootMargin = "0px"
  readonly thresholds = [0]
  private readonly targets = new Set<Element>()

  constructor(private readonly callback: IntersectionObserverCallback) {
    ControlledIntersectionObserver.instances.push(this)
  }

  disconnect() {
    this.targets.clear()
  }

  observe(target: Element) {
    this.targets.add(target)
  }

  takeRecords() {
    return []
  }

  unobserve(target: Element) {
    this.targets.delete(target)
  }

  observes(target: Element) {
    return this.targets.has(target)
  }

  emit(target: Element, observation: Observation) {
    if (!this.targets.has(target)) throw new Error("Target is not observed")
    const boundingClientRect = rect(observation.top, observation.bottom)
    this.callback([{
      time: 0,
      target,
      rootBounds: null,
      boundingClientRect,
      intersectionRect: observation.isIntersecting
        ? boundingClientRect
        : rect(0, 0),
      isIntersecting: observation.isIntersecting,
      intersectionRatio: observation.isIntersecting ? 1 : 0,
    }], this)
  }
}

const product = buildStorefrontProduct({
  _id: "overlay-test",
  title: { en: "Ink Garden 01" },
  slug: { current: "ink-garden-01" },
  productionModel: "hand_painted_to_order",
  collectionType: "new_collection",
  rightsStatus: "approved",
  migrationStatus: "ready",
  standardSizes: [
    { _key: "80x100", label: "80 x 100 cm", priceCny: 2600 },
  ],
  frameOptions: [
    { _key: "rolled", label: "Rolled canvas", priceDeltaCny: 0 },
  ],
}, [{
  src: "/ink-garden.webp",
  alt: "Ink Garden 01",
  width: 800,
  height: 1000,
}])

describe("purchase overlay integration", () => {
  beforeEach(() => {
    navigationState.pathname = "/artwork/ink-garden-01"
    ControlledIntersectionObserver.instances = []
    vi.stubGlobal("IntersectionObserver", ControlledIntersectionObserver)
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(() => rect(1200, 1248))
    window.localStorage.clear()
    const footer = document.createElement("footer")
    document.body.appendChild(footer)
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    document.body.innerHTML = ""
  })

  it("keeps sticky purchase available across non-intersecting jumps until the primary action is visible", async () => {
    renderStorefront(1440, 1000)
    const mainButton = screen.getByRole("button", { name: /Add to Cart/ })
    const mainAction = mainButton.parentElement as HTMLDivElement
    let actionRect = rect(1200, 1248)
    mainAction.getBoundingClientRect = () => actionRect

    await act(async () => {
      window.dispatchEvent(new Event("scroll"))
    })
    expect(screen.queryByRole("complementary", {
      name: "Selected artwork purchase",
    })).toBeNull()

    actionRect = rect(-1204, -1156)
    await act(async () => {
      window.dispatchEvent(new Event("scroll"))
    })

    expect(screen.getByRole("complementary", {
      name: "Selected artwork purchase",
    })).not.toBeNull()

    actionRect = rect(1200, 1248)
    await act(async () => {
      window.dispatchEvent(new Event("resize"))
    })
    expect(screen.getByRole("complementary", {
      name: "Selected artwork purchase",
    })).not.toBeNull()

    actionRect = rect(700, 748)
    await act(async () => {
      window.dispatchEvent(new Event("scroll"))
    })
    expect(screen.queryByRole("complementary", {
      name: "Selected artwork purchase",
    })).toBeNull()
  })

  it("hides both closed and open floating chat states on mobile artwork details", () => {
    const view = renderChatWidget()

    const chatButton = screen.getByRole("button", { name: "Open WhatsApp support" })
    expect(chatButton.classList.contains("hidden")).toBe(true)
    expect(chatButton.classList.contains("md:flex")).toBe(true)

    fireEvent.click(chatButton)
    const chatPanel = view.container.querySelector(".yiiart-chat-widget")
    expect(chatPanel?.classList.contains("hidden")).toBe(true)
    expect(chatPanel?.classList.contains("md:block")).toBe(true)
  })

  it("preserves floating chat on non-product mobile routes", () => {
    navigationState.pathname = "/cart"
    const view = renderChatWidget()

    const chatButton = screen.getByRole("button", { name: "Open WhatsApp support" })
    expect(chatButton.classList.contains("hidden")).toBe(false)
    expect(chatButton.classList.contains("flex")).toBe(true)

    fireEvent.click(chatButton)
    const chatPanel = view.container.querySelector(".yiiart-chat-widget")
    expect(chatPanel?.classList.contains("hidden")).toBe(false)
    expect(chatPanel?.classList.contains("block")).toBe(true)
  })

  it("keeps mobile sticky purchase accessible after the primary controls leave", async () => {
    renderStorefront(390, 844)
    const mainButton = screen.getByRole("button", { name: /Add to Cart/ })
    const mainAction = mainButton.parentElement as HTMLDivElement
    let actionRect = rect(640, 732)
    mainAction.getBoundingClientRect = () => actionRect

    await act(async () => {
      window.dispatchEvent(new Event("scroll"))
    })
    expect(screen.queryByRole("complementary", {
      name: "Selected artwork purchase",
    })).toBeNull()

    actionRect = rect(-1204, -1156)
    await act(async () => {
      window.dispatchEvent(new Event("scroll"))
    })
    expect(screen.getByRole("complementary", {
      name: "Selected artwork purchase",
    })).not.toBeNull()
  })
})

function renderStorefront(width: number, height: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: width,
  })
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: height,
  })
  return render(
    <LanguageProvider>
      <CurrencyProvider>
        <WishlistProvider>
          <CartProvider>
            <ProductPurchasePanel
              product={product}
              directCheckoutAvailable
              invoiceUrl="/invoice"
              whatsappUrl="https://wa.me/example"
            />
            <ChatWidget />
          </CartProvider>
        </WishlistProvider>
      </CurrencyProvider>
    </LanguageProvider>,
  )
}

function renderChatWidget() {
  return render(
    <LanguageProvider>
      <ChatWidget />
    </LanguageProvider>,
  )
}

function rect(top: number, bottom: number): DOMRect {
  return {
    x: 0,
    y: top,
    width: 300,
    height: Math.max(0, bottom - top),
    top,
    right: 300,
    bottom,
    left: 0,
    toJSON: () => ({}),
  }
}
