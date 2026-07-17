interface Props {
  open: boolean;
  onToggle: () => void;
  /** Показувати довідку для сенсорного керування замість мишачого. */
  isTouch: boolean;
}

/** Кнопка «?» та панель підказок керування. */
export function HelpOverlay({ open, onToggle, isTouch }: Props) {
  return (
    <>
      <button className="btn help-btn ui-card" onClick={onToggle} title="Довідка з керування">
        ?
      </button>
      {open && (
        <div className="help-panel ui-card">
          <h2>Керування оглядом</h2>
          <ul>
            {isTouch ? (
              <>
                <li><kbd>1 палець</kbd> — обертати камеру</li>
                <li><kbd>2 пальці</kbd> — масштаб (щипок) і зсув сцени</li>
              </>
            ) : (
              <>
                <li><kbd>ЛКМ</kbd> + рух — обертати камеру</li>
                <li><kbd>Коліщатко</kbd> — наблизити / віддалити</li>
                <li><kbd>ПКМ</kbd> + рух — зсунути сцену</li>
                <li><kbd>Дотик</kbd> — один палець обертає, два масштабують</li>
              </>
            )}
          </ul>
          <h2 style={{ marginTop: 10 }}>Підказки</h2>
          <ul>
            <li>Стіна, за якою стоїть камера, ховається автоматично — сцену видно з будь-якого боку.</li>
            <li>Погляньте згори — розстановка відповідає плану кабінету.</li>
            <li>На арені в центрі класу робот SPIKE Prime їде трасою, а у вітрині — виставка роботів.</li>
            {isTouch ? (
              <li>«Швидкий режим» увімкнено автоматично — «✦ Висока якість» повертає тіні.</li>
            ) : (
              <li>«Скріншот» і «Запис відео» зберігають файли на ваш пристрій.</li>
            )}
          </ul>
          <p className="help-footer">@Feliks Kostukevych · {new Date().getFullYear()}</p>
        </div>
      )}
    </>
  );
}
