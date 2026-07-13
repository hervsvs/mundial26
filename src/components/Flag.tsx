// Bandera SVG real (paquete flag-icons), importada como asset del bundle:
// funciona igual en Windows, Mac y celulares, en dev y en producción,
// incluidas Escocia (gb-sct) e Inglaterra (gb-eng).
import type { Team } from '../data/teams'

import mx from 'flag-icons/flags/4x3/mx.svg'
import za from 'flag-icons/flags/4x3/za.svg'
import kr from 'flag-icons/flags/4x3/kr.svg'
import cz from 'flag-icons/flags/4x3/cz.svg'
import ch from 'flag-icons/flags/4x3/ch.svg'
import ca from 'flag-icons/flags/4x3/ca.svg'
import ba from 'flag-icons/flags/4x3/ba.svg'
import qa from 'flag-icons/flags/4x3/qa.svg'
import br from 'flag-icons/flags/4x3/br.svg'
import ma from 'flag-icons/flags/4x3/ma.svg'
import gbSct from 'flag-icons/flags/4x3/gb-sct.svg'
import ht from 'flag-icons/flags/4x3/ht.svg'
import us from 'flag-icons/flags/4x3/us.svg'
import au from 'flag-icons/flags/4x3/au.svg'
import py from 'flag-icons/flags/4x3/py.svg'
import tr from 'flag-icons/flags/4x3/tr.svg'
import de from 'flag-icons/flags/4x3/de.svg'
import ci from 'flag-icons/flags/4x3/ci.svg'
import ec from 'flag-icons/flags/4x3/ec.svg'
import cw from 'flag-icons/flags/4x3/cw.svg'
import nl from 'flag-icons/flags/4x3/nl.svg'
import jp from 'flag-icons/flags/4x3/jp.svg'
import se from 'flag-icons/flags/4x3/se.svg'
import tn from 'flag-icons/flags/4x3/tn.svg'
import be from 'flag-icons/flags/4x3/be.svg'
import eg from 'flag-icons/flags/4x3/eg.svg'
import ir from 'flag-icons/flags/4x3/ir.svg'
import nz from 'flag-icons/flags/4x3/nz.svg'
import es from 'flag-icons/flags/4x3/es.svg'
import cv from 'flag-icons/flags/4x3/cv.svg'
import uy from 'flag-icons/flags/4x3/uy.svg'
import sa from 'flag-icons/flags/4x3/sa.svg'
import fr from 'flag-icons/flags/4x3/fr.svg'
import no from 'flag-icons/flags/4x3/no.svg'
import sn from 'flag-icons/flags/4x3/sn.svg'
import iq from 'flag-icons/flags/4x3/iq.svg'
import ar from 'flag-icons/flags/4x3/ar.svg'
import at from 'flag-icons/flags/4x3/at.svg'
import dz from 'flag-icons/flags/4x3/dz.svg'
import jo from 'flag-icons/flags/4x3/jo.svg'
import co from 'flag-icons/flags/4x3/co.svg'
import pt from 'flag-icons/flags/4x3/pt.svg'
import cd from 'flag-icons/flags/4x3/cd.svg'
import uz from 'flag-icons/flags/4x3/uz.svg'
import gbEng from 'flag-icons/flags/4x3/gb-eng.svg'
import hr from 'flag-icons/flags/4x3/hr.svg'
import gh from 'flag-icons/flags/4x3/gh.svg'
import pa from 'flag-icons/flags/4x3/pa.svg'

const FLAGS: Record<string, string> = {
  mx, za, kr, cz, ch, ca, ba, qa, br, ma, 'gb-sct': gbSct, ht, us, au, py, tr,
  de, ci, ec, cw, nl, jp, se, tn, be, eg, ir, nz, es, cv, uy, sa, fr, no, sn,
  iq, ar, at, dz, jo, co, pt, cd, uz, 'gb-eng': gbEng, hr, gh, pa,
}

export function Flag({ team, size = 'md' }: { team: Team; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const src = FLAGS[team.iso]
  if (!src) return null
  return <img className={`flag flag-${size}`} src={src} alt={team.name} title={team.name} />
}
