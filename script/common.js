$(function () {
    console.log("✅ jQuery에서 DOM 로드 완료!");

    /** ================================
     * 1. 경로 자동 변경 함수 (이미지 및 링크)
     * ================================= */
    function updatePaths() {
        console.log("✅ 경로 자동 적용 실행됨!");

        const basePath = window.location.origin.includes("s3") ? "" : "/modelHomePage";

        // ✅ 링크 경로 수정 (중복 적용 방지)
        document.querySelectorAll("a").forEach(link => {
            const href = link.getAttribute("href");
            if (
                href &&
                !href.startsWith("http") &&  // 외부 링크가 아니면서
                !href.startsWith("#") &&      // 내부 앵커링크가 아니면서
                !href.startsWith(basePath)    // 이미 basePath가 적용되지 않은 경우
            ) {
                link.setAttribute("href", `${basePath}/${href.replace(/^\/+/, "")}`);
            }
        });

        // ✅ 이미지 경로 수정 (중복 적용 방지)
        document.querySelectorAll("img").forEach(img => {
            const src = img.getAttribute("src");
            if (src && !src.startsWith("http") && !src.startsWith(basePath)) {
                img.setAttribute("src", `${basePath}/${src.replace(/^\/+/, "")}`);
            }
        });

        console.log("✅ 경로 자동 적용 완료!");
    }

    window.updatePaths = updatePaths; // ✅ 전역으로 등록
    updatePaths(); // ✅ 초기 로딩 시 경로 수정


    /** ================================
     * 1. CSS 파일 동적 로드
     * ================================= */
    function loadCSS(href) {
        let link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
    }

    // 공통 CSS 파일 로드
    loadCSS("./css/common.css");

    /** ================================
     * 2. 공통 Header & Footer 로드 후 `common.js` 적용
     * ================================= */
    function loadComponent(elementId, filePath, callback) {
        const basePath = window.location.origin.includes("s3") ? "" : "/modelHomePage"; // S3에서는 "" 처리
        fetch(`${basePath}/${filePath.replace(/^\/+/, "")}`)
            .then(response => response.text())
            .then(data => {
                document.getElementById(elementId).innerHTML = data;
                updatePaths(); // ✅ fetch() 후에도 경로 다시 변경
                if (callback) callback(); // 로드 후 실행할 콜백
            })
            .catch(error => console.error(`Error loading ${filePath}:`, error));
    }

    function initializeCommonFeatures() {
        console.log("🔄 common.js 다시 실행");
        updatePaths(); // ✅ fetch()가 완료된 후 경로 변경 다시 실행

        /** ========== 메뉴 동작 (모바일 & 데스크탑) ========== */
        function updateMenuBehavior() {
            const isMobile = window.innerWidth <= 768;

            if (isMobile) {
                $("#menuToggle").off("click").on("click", function (e) {
                    e.stopPropagation();
                    $(this).toggleClass("open");
                    $(".sidemenu").stop().slideToggle();
                });

                $(".sidemenu").off("click").on("click", function (e) {
                    e.stopPropagation();
                });

                $(document).off("click").on("click", function () {
                    $(".sidemenu").slideUp();
                    $("#menuToggle").removeClass("open");
                });

            } else {
                $("#menuToggle").removeClass("open");
                $(".sidemenu").hide();

                $(".menuWrap").off("mouseenter").on("mouseenter", function () {
                    $(".sidemenu").stop().slideDown();
                    $("#menuToggle").addClass("open");
                });

                $(".menuWrap, .sidemenu").off("mouseleave").on("mouseleave", function () {
                    $(".sidemenu").stop().slideUp();
                    $("#menuToggle").removeClass("open");
                });

                $(".menuWrap, .sidemenu").off("click").on("click", function () {
                    $(".sidemenu").stop().slideUp();
                    $("#menuToggle").removeClass("open");
                });
            }
        }

        updateMenuBehavior();
        $(window).on("resize", updateMenuBehavior);

        /** ========== 팝업 닫기 ========== */
        $(".popupCheck img").click(() => {
            $(".popup").hide();
        });

        /** ========== 공지사항 검색 & 필터 ========== */
        $("#searchButton").click(() => {
            const searchText = $("#searchInput").val().toLowerCase();
            const filterCategory = $("#categoryFilter").val();

            $(".notice-item").each(function () {
                const title = $(this).find(".notice-title").text().toLowerCase();
                const content = $(this).find("p:nth-child(4)").text().toLowerCase();
                const category = $(this).data("category");

                $(this).toggle(
                    (filterCategory === "" || category.includes(filterCategory)) &&
                    (title.includes(searchText) || content.includes(searchText))
                );
            });
        });

        /** ========== 공지사항 조회수 증가 ========== */
        $(".notice-item").click(function () {
            let viewCountElement = $(this).find(".view-count span");

            if (viewCountElement.length) {
                let currentViews = parseInt(viewCountElement.text());
                viewCountElement.text(currentViews + 1);
            }
        });
    }

    // Header & Footer 로드 후 `initializeCommonFeatures()` 실행
    loadComponent("header", "components/header.html", initializeCommonFeatures);
    loadComponent("footer", "components/footer.html");
    /** ================================
     * 1. 인트로 화면 전환
     * ================================= */
    const text = "Model Zero";
    let index = 0;
    const typingElement = $("#typing-text");

    function typeEffect() {
        if (index < text.length) {
            typingElement.append(text.charAt(index)); // 한 글자씩 추가
            index++;
            setTimeout(typeEffect, 150); //글자 개당(0.15초 타이핑)
        }
        else {
            setTimeout(() => {
                $("#intro").fadeOut(1000, function () {
                    $("#main-content").fadeIn(500); // 메인화면 표시
                });
            }, 500); //0.5초뒤 메인화면 나옴
        }
    }

    typeEffect();

    /** ================================
     * 3. 커스텀 마우스 커서
     * ================================= */
    const cursor = document.querySelector(".custom-cursor");

    document.addEventListener("mousemove", (e) => {
        cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    });

    document.addEventListener("click", () => {
        cursor.style.width = "60px";
        cursor.style.height = "60px";
        setTimeout(() => {
            cursor.style.width = "40px";
            cursor.style.height = "40px";
        }, 200);
    });

    document.querySelectorAll("a, button").forEach((el) => {
        el.addEventListener("mouseenter", () => {
            cursor.style.backgroundColor = "rgba(0, 94, 212, 0.5)";
            cursor.style.border = "2px solid rgb(0, 94, 212)";
        });

        el.addEventListener("mouseleave", () => {
            cursor.style.backgroundColor = "rgba(255, 255, 255, 0)";
            cursor.style.border = "1px solid rgba(255, 255, 255, 0.8)";
        });
    });

    /** ================================
     * 4. Top 버튼 설정
     * ================================= */
    const topButton = document.getElementById("topButton");

    window.addEventListener("scroll", () => {
        topButton.style.display = window.scrollY > 100 ? "block" : "none";
    });

    topButton.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    /** ================================
     * 5. 자주 묻는 질문 (FAQ)
     * ================================= */
    $(".question").click(function () {
        const parent = $(this).parent();

        if (parent.hasClass("active")) {
            parent.removeClass("active").find(".answer").slideUp();
        } else {
            $(".faq-item").removeClass("active").find(".answer").slideUp();
            parent.addClass("active").find(".answer").slideDown();
        }
    });

    /** ================================
     * 6. 팝업 닫기
     * ================================= */
    $(".popupCheck img").click(() => {
        $(".popup").hide();
    });

    /** ================================
     * 7. 공지사항 검색 & 필터
     * ================================= */
    /*
        $("#searchButton").click(() => {
        const searchText = $("#searchInput").val().toLowerCase();
        const filterCategory = $("#categoryFilter").val();

        $(".notice-item").each(function () {
            const title = $(this).find(".notice-title").text().toLowerCase();
            const content = $(this).find("p:nth-child(4)").text().toLowerCase();
            const category = $(this).data("category");

            $(this).toggle(
                (filterCategory === "" || category.includes(filterCategory)) &&
                (title.includes(searchText) || content.includes(searchText))
            );
        });
    });*/

    function filterDataList(list, text, category) {
        text = text.toLowerCase(); // 소문자 통일

        return list.filter((item) => {
            const title = item.title?.toLowerCase() || "";
            const contentText = $(item.content).text().toLowerCase(); // HTML 안의 텍스트만 추출

            if (category === "제목") {
                return title.includes(text);
            } else if (category === "내용") {
                return contentText.includes(text);
            } else {
                // 전체 검색 (제목 + 내용)
                return title.includes(text) || contentText.includes(text);
            }
        });

    }

    window.filterDataList = filterDataList;

    /** ================================
     * 8. 공지사항 조회수 증가
     * ================================= */
    $(".notice-item").click(function () {
        let viewCountElement = $(this).find(".view-count span");

        if (viewCountElement.length) {
            let currentViews = parseInt(viewCountElement.text());
            viewCountElement.text(currentViews + 1);
        }
    });

    /** ================================
     * 9. 공통 페이지네이션 설정
     * ================================= */
    function setupPagination(containerSelector, itemSelector, itemsPerPage) {
        const $container = $(containerSelector);
        const $items = $(itemSelector);
        const totalPages = Math.max(1, Math.ceil($items.length / itemsPerPage));
        let currentPage = 1;

        function showPage(page) {
            if (page < 1 || page > totalPages) return;

            $items.hide().slice((page - 1) * itemsPerPage, page * itemsPerPage).show();
            updatePagination();
        }

        function updatePagination() {
            let $pageNumbers = $container.find(".page-numbers");
            $pageNumbers.empty(); // 기존 숫자 버튼 초기화

            for (let i = 1; i <= totalPages; i++) {
                let pageButton = $("<button>")
                    .addClass("page-number")
                    .text(i)
                    .attr("data-page", i);

                if (i === currentPage) {
                    pageButton.addClass("active"); // 현재 페이지는 스타일 다르게
                }

                pageButton.click(function () {
                    currentPage = i;
                    showPage(currentPage);
                });

                $pageNumbers.append(pageButton);
            }

            // 이전/다음 버튼 활성화 여부 설정
            $container.find(".prev").prop("disabled", currentPage === 1);
            $container.find(".next").prop("disabled", currentPage === totalPages);
        }

        $container.find(".prev").click(function () {
            if (currentPage > 1) {
                currentPage--;
                showPage(currentPage);
            }
        });

        $container.find(".next").click(function () {
            if (currentPage < totalPages) {
                currentPage++;
                showPage(currentPage);
            }
        });

        showPage(currentPage);
    }

    setupPagination(".pagination[data-type='faq']", ".faq-item", 4);
    setupPagination(".pagination[data-type='notice']", ".notice-item", 6);
    window.setupPagination = setupPagination; // ✅ 전역으로 등록
});

