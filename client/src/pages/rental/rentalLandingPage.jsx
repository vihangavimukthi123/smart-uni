import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "./components/footer";
import HeadNavbar from "./components/nav2";

export default function UniRent() {
  const navigate = useNavigate();

  useEffect(() => {
    // Load Google Fonts
    const fontLink = document.createElement("link");
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap";
    fontLink.rel = "stylesheet";
    document.head.appendChild(fontLink);

    const iconLink = document.createElement("link");
    iconLink.href =
      "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap";
    iconLink.rel = "stylesheet";
    document.head.appendChild(iconLink);

    // Load Tailwind
    const tailwindScript = document.createElement("script");
    tailwindScript.src =
      "https://cdn.tailwindcss.com?plugins=forms,container-queries";
    document.head.appendChild(tailwindScript);

    tailwindScript.onload = () => {
      window.tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              primary: "#1152d4",
              "background-light": "#f6f6f8",
              "background-dark": "#101622",
            },
            fontFamily: {
              display: ["Inter"],
            },
            borderRadius: {
              DEFAULT: "0.25rem",
              lg: "0.5rem",
              xl: "0.75rem",
              full: "9999px",
            },
          },
        },
      };
    };
  }, []);

  return (
    <div className="bg-[#f6f6f8] font-[Inter] -900">
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          {/* Header */}
          <HeadNavbar />

          <main className="flex-1">
            {/* Hero Section */}
            <section className="max-w-[1280px] mx-auto px-6 py-12 md:py-20 lg:px-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
                <div className="flex-col gap-4">
                  <div className="flex-col gap-4">
                    <span className="text-[#1152d4] tracking-widest uppercase">
                      Premium Equipment Rentals
                    </span>
                    <h1 className="-900 md: leading-[1.1] tracking-tight">
                      The Equipment You Need for Your{" "}
                      <span className="text-[#1152d4]">
                        Next University Event
                      </span>
                    </h1>
                    <p className="-600 leading-relaxed max-w-lg">
                      Rent high-quality event gear in minutes. From staging and
                      AV equipment to seating and furniture, we connect campus
                      organizers with the best local item suppliers.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => navigate("/itemlist")}
                      className="flex min-w-[180px] cursor-pointer flex-center card-rounded h-14 px-8 bg-[#1152d4] tracking-wide card-shadow card-shadow-500/20 hover:scale-[1.02] transition-transform"
                    >
                      Start Renting
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <div
                    className="w-full aspect-[4/3] bg-slate-200 card-rounded overflow-hidden card-shadow"
                    style={{
                      backgroundImage: "url('/images/land_img.jpg')",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div className="absolute -bottom-4 -left-6 bg-white p-4 card-rounded card-shadow hidden md:block">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#1152d4]/10 p-4 card-rounded">
                        <span className="material-symbols-outlined text-[#1152d4]">
                          local_shipping
                        </span>
                      </div>
                      <div>
                        <p className="-900">
                          Direct Campus Delivery
                        </p>
                        <p className="-500">
                          To any building or quad
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* AI Generator Section */}
            <section className="bg-[#1152d4] py-20 px-6 lg:px-10">
              <div className="max-w-[1100px] mx-auto mb-12">
                <h2 className="md: mb-4">
                  AI Item List Generator
                </h2>
                <p className="opacity-90 max-w-2xl mx-auto">
                  Not sure what gear you need? Describe your event and our AI
                  will generate a complete list of required items—from chairs to
                  AV—and match them with local suppliers.
                </p>
              </div>
              <div className="max-w-[960px] mx-auto bg-white card-rounded card-shadow overflow-hidden p-4 md:p-4">
                <div className="flex-col gap-4">
                  {/* <div className="relative flex-1">
                    <div className="flex w-full items-stretch card-rounded h-16 md:h-20 card-shadow border-2 overflow-hidden">
                      <input
                        className="flex-1 px-6 -900 focus:outline-none border-none placeholder:-400"
                        placeholder="Describe your event (e.g., Outdoor career fair for 1000 students)..."
                      />
                      <button className="bg-[#1152d4] px-8 transition-colors flex items-center gap-4">
                        <span className="material-symbols-outlined">
                          auto_awesome
                        </span>
                        <span onClick={() => navigate("/kit-generator")}>
                          Generate List
                        </span>
                      </button>
                    </div>
                  </div> */}
                  <div className="relative flex-1 flex justify-center items-center">
                    <button
                      onClick={() => navigate("/gen_kit")}
                      className="bg-[#1152d4] px-8 transition-colors flex items-center gap-4 card-rounded h-12"
                    >
                      <span className="material-symbols-outlined">
                        auto_awesome
                      </span>
                      Generate List
                    </button>
                  </div>
                  <div className="space-y-6">
                    <h3 className="-900 flex items-center gap-4">
                      <span className="material-symbols-outlined text-[#1152d4]">
                        checklist
                      </span>
                      Recommended Rental Items
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        {
                          img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAzjMRZa6VRlQskqVE_pI-yZTbf4p1-V8JFvDhrKKb0pnxbdz54AyxBJYY2r_dMjVod7JpQDW7xdDedWXE2k_mFFzdNosUS9L8oEsc81THcd_j7N-gp_TWzPb9MtC_PcBQm5jAIyrAwULdrJ_N_K5SYxzIEN-lnJrMIoUE8CKa806Od9D84RC9X8cUezCAE8EZY2gczXgo_vTE4fZHFEGheh2E6cU9aMJ0PpOEXGos9_lQstsj4zOqYuQzYE9oo4l_zbhIs3IuQLbH9",
                          name: "Folding Chairs",
                          detail: "Need: 300 units",
                          supplier: "CampusPro",
                        },
                        {
                          img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAYlBzo5Et6_PIzT-T90sn-Ydj8mFCcPzjJkpYMsDetrVtf-aj5UMYEgfwxDLbZNC-wFVsWEe3KjN_y4-w7om1jKuqUYUViH1_voahHXrU5__p6GrmQMJGBt13T6AK1RmQ77yWLZo55t9nYsxET_KdnYEi0gmE4IC-aTTFN0ZvV-ep1tgf8H9G-cflL34pzZY_uxES-ERVrTF7HCbDHhVgUk-CkjlCzqS2FzIq6KHmdym-XHLtlpXlqJ1uTLP8TcyzCP67sbuS7zzXH",
                          name: "HD Projector",
                          detail: "4K/8000 Lumens",
                          supplier: "TechRent",
                        },
                        {
                          img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCvkv6v7OQtLFp8_VtzPaL_2fR7t3Dxl8PcewPVfQ_idAsTDO7NTdYodMD0voX_AJ84p-DqojI0Wo4r7zk79kjFtzcrCG5gayOmgZ375jpD_chekAj8rXVNKlCeewrcBVYC7Morq0LkkQQSnyB9RQQpQHMwxnDJae3a4J7FMckax0qB0zpS7VvtbftukRiP7YKbuTqIi3z8DRw5h7M-1adXCwXI-GCPmghgi7EsByPgz_RjNRCfJRED_TzhtaSmra5ALRPWllLGCXkD",
                          name: "Portable Stage",
                          detail: "12x16ft Modular",
                          supplier: "BuildEvents",
                        },
                        {
                          img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCkTGxOdPIU-cOqb04B-QckwGM_7WU738d26B9MKGQ7-Gfv80PTAt3GmGdV2lD5dPOIe1DjrJuMGCfxocALCbmvnz5GuGyBo_ayFr4lLMelKAgxJvXeNzh-wCJ1UVFF6dP4x8dIU-bjl9QP4tsW__1Ml59WG-lOEIZbm2U6UofRbvOvB2HxGWVje82Ff652r-HP9PT9eZaLFkRcMWidV-fYsk1EAdc_YRpPnLx1es3Wy7P1BPM7ZeB162ezw1obGuIIngabHICI8JIm",
                          name: "Sound System",
                          detail: "Full PA Package",
                          supplier: "Sonic Rentals",
                        },
                      ].map((item) => (
                        <div
                          key={item.name}
                          className="p-4 card-rounded bg-slate-50 hover:border-[#1152d4]/30 group"
                        >
                          <div
                            className="w-full aspect-square bg-slate-200 card-rounded mb-4 overflow-hidden"
                            style={{
                              backgroundImage: `url("${item.img}")`,
                              backgroundSize: "cover",
                            }}
                          />
                          <p className="-900">
                            {item.name}
                          </p>
                          <p className="-500">
                            {item.detail}
                          </p>
                          <div className="mt-2 text-[#1152d4]">
                            Supplier: {item.supplier}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Rental Solutions */}
            <section className="py-24 px-6 lg:px-10 bg-white">
              <div className="max-w-[1280px] mx-auto">
                <div className="mb-16">
                  <h2 className="-900 mb-4">
                    Rental Solutions
                  </h2>
                  <p className="-500">
                    We provide the hardware so you can focus on the event
                    experience.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      icon: "inventory_2",
                      title: "Item Rental",
                      desc: "Instantly browse and book over 10,000 items from seating to professional AV systems.",
                    },
                    {
                      icon: "local_shipping",
                      title: "Fast Delivery to Campus",
                      desc: "Logistics simplified. We coordinate delivery and pickup directly to your specified campus location.",
                    },
                    {
                      icon: "verified_user",
                      title: "Verified Suppliers",
                      desc: "Every item is sourced from pre-vetted local vendors ensuring quality and reliability.",
                    },
                  ].map((card) => (
                    <div
                      key={card.title}
                      className="flex-col items-center p-4 card-rounded bg-slate-50 border-transparent hover:border-[#1152d4]"
                    >
                      <div className="w-16 h-16 bg-[#1152d4]/10 card-rounded flex flex-center mb-6">
                        <span className="material-symbols-outlined text-[#1152d4]">
                          {card.icon}
                        </span>
                      </div>
                      <h3 className="mb-3 -900">
                        {card.title}
                      </h3>
                      <p className="-600">{card.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 px-6 lg:px-10 bg-[#f6f6f8]">
              <div className="max-w-[1280px] mx-auto">
                <h2 className="-900 mb-12">
                  Trusted by University Organizers
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      stars: 5,
                      text: '"UniRent is our go-to for all gear. The item list generator accurately identified exactly how many tables and projectors we needed."',
                      avatar:
                        "https://lh3.googleusercontent.com/aida-public/AB6AXuDU9d1nmbKNKbriAnOpJUcxRoEzUZydqj5kmIvwReUP7IZiDDP6wUdQev0xkeeJo1RuaVmamzwZ4M-AOB1QeBwWulPN8DDpMSSfqGtkzBcWxzonYJQS1UspW07yKwvf8sUMrL-Lm1CUhtGZBJQZjLxfafHda9_8C2FdwiMIPR76gqEFoLFf7fQb1l4ZbIM6TB_QMpwDcL2U9lkujMHxtj7jcuVXkIGOwsS5LGdfTFB25MPL3EyCJqkj-oakwwXu0OP3w13_o5TMNM93",
                      name: "Sarah Jenkins",
                      role: "Student Union Lead",
                      half: false,
                    },
                    {
                      stars: 5,
                      text: '"As a supplier, UniRent makes it incredibly easy to manage equipment inventory and reach student organizations without marketing overhead."',
                      avatar:
                        "https://lh3.googleusercontent.com/aida-public/AB6AXuCace91jcurDAEDnLMYzrOOThZ6Ss-huUyPpOqPoXKpjeAcQk9IxdYDRko3m8x3qHIWk1o3fVeBss5b7dkJ3YL-EIcaAH2l6bZspdx4GoW8IQ7j0kf26oAoqR-8bV8FStFVNmB4xjQivCaNPDZTLVBXKGpjWeUgREHHgO5BCQtwEkrjKQf9m-EYS4Pt6lSfQw2iVGNrlUFLve3PuMoHowGYzxJXRO_hxIAx8XMN6mr0Bxk3JgPffdinskqnJoUVRX3nmrDnIBv_g5sN",
                      name: "Marcus Thorne",
                      role: "Peak Rentals CEO",
                      half: false,
                    },
                    {
                      stars: 4,
                      text: '"The equipment quality was top-notch. Finding a specific stage size was effortless through their rental catalog."',
                      avatar:
                        "https://lh3.googleusercontent.com/aida-public/AB6AXuD13p730jzPJ1HvrhPU4s5aXVndXfHRlvjLeA92Yzyo5xlDTrX48sm-7XlinuoZav4sa4VQ4Yd1GRuZBtmpco95gbpYyLXgZzWe4GSKFT-duyB88wS62u5nEeiDkpZoqeTMVrFwxAE9tCmbraeM5BdCrrekAlfoVfnxbaifZnmt5ovmsN8tWjzinxA00arMRHMYhrC51u16KmGwbrHY-7hPdBsbWr4NbKdMSsNANpZNgcayMxwr45OfzF2BExrhLAGw70Suwe-qUv8Z",
                      name: "Aaliyah Chen",
                      role: "Campus Club President",
                      half: true,
                    },
                  ].map((t) => (
                    <div
                      key={t.name}
                      className="bg-white p-4 card-rounded card-shadow"
                    >
                      <div className="flex gap-4 -400 mb-4">
                        {Array.from({ length: t.stars }).map((_, i) => (
                          <span
                            key={i}
                            className="material-symbols-outlined fill-current"
                          >
                            star
                          </span>
                        ))}
                        {t.half && (
                          <span className="material-symbols-outlined fill-current">
                            star_half
                          </span>
                        )}
                      </div>
                      <p className="-700 italic mb-6">{t.text}</p>
                      <div className="flex items-center gap-4">
                        <div
                          className="w-10 h-10 card-rounded bg-slate-300"
                          style={{
                            backgroundImage: `url("${t.avatar}")`,
                            backgroundSize: "cover",
                          }}
                        />
                        <div>
                          <p className="-900">
                            {t.name}
                          </p>
                          <p className="-500 uppercase tracking-tighter">
                            {t.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
}

